import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { notifyNewOrder } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { getAdminFee } from "@/lib/settings";

function createPickupCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Login is required", 401);
  }

  if (currentUser.role !== "CUSTOMER") {
    return fail("Only customers can create orders", 403);
  }

  const body = await request.json();
  const quantity = Math.max(1, Number(body.quantity ?? 1));

  if (!body.listingId) {
    return fail("listingId is required");
  }

  const listing = await prisma.foodListing.findUnique({
    where: {
      id: body.listingId,
    },
    include: {
      merchant: {
        select: {
          verificationStatus: true,
        },
      },
    },
  });

  if (
    !listing ||
    listing.status !== "ACTIVE" ||
    listing.merchant.verificationStatus !== "VERIFIED"
  ) {
    return fail("Listing is not available", 404);
  }

  if (listing.mode !== "SALE") {
    return fail("Donation listings must be claimed by charities", 400);
  }

  if (quantity > listing.quantity) {
    return fail("Requested quantity exceeds available stock", 400);
  }

  try {
    const adminFee = await getAdminFee();
    const subtotal = listing.discountedPrice * quantity;
    const order = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.foodListing.updateMany({
        where: {
          id: listing.id,
          status: "ACTIVE",
          quantity: {
            gte: quantity,
          },
        },
        data: {
          quantity: {
            decrement: quantity,
          },
          status: listing.quantity === quantity ? "SOLD_OUT" : "ACTIVE",
        },
      });

      if (updateResult.count === 0) {
        throw new Error("STOCK_UNAVAILABLE");
      }

      return tx.order.create({
        data: {
          customerId: currentUser.id,
          listingId: listing.id,
          merchantId: listing.merchantId,
          quantity,
          adminFee,
          totalPrice: subtotal + adminFee,
          status: "PENDING",
          pickupCode: createPickupCode(),
        },
        include: {
          listing: true,
          merchant: true,
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    // Send notification to merchant
    const merchant = await prisma.merchant.findUnique({
      where: { id: listing.merchantId },
      select: { userId: true },
    });

    if (merchant) {
      await notifyNewOrder(order.id, merchant.userId, listing.title);
    }

    return ok(order, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "STOCK_UNAVAILABLE") {
      return fail("Requested quantity exceeds available stock", 400);
    }

    throw error;
  }
}
