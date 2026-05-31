import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { notifyNewClaim } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

function createPickupCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Login is required", 401);
  }

  if (currentUser.role !== "CHARITY" || !currentUser.charityId) {
    return fail("Only charities can create donation claims", 403);
  }

  const charityId = currentUser.charityId;
  const body = await request.json();
  const quantity = Math.max(1, Number(body.quantity ?? 1));

  if (!body.listingId) {
    return fail("listingId is required");
  }

  const listing = await prisma.foodListing.findUnique({
    where: {
      id: body.listingId,
    },
  });

  if (!listing || listing.status !== "ACTIVE") {
    return fail("Listing is not available", 404);
  }

  if (listing.mode !== "DONATION") {
    return fail("Sale listings must be ordered by customers", 400);
  }

  if (quantity > listing.quantity) {
    return fail("Requested quantity exceeds available stock", 400);
  }

  try {
    const claim = await prisma.$transaction(async (tx) => {
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

      return tx.donationClaim.create({
        data: {
          charityId,
          listingId: listing.id,
          merchantId: listing.merchantId,
          quantity,
          status: "REQUESTED",
          pickupCode: createPickupCode(),
        },
        include: {
          charity: true,
          listing: true,
          merchant: true,
        },
      });
    });

    // Send notification to merchant
    const merchant = await prisma.merchant.findUnique({
      where: { id: listing.merchantId },
      select: { userId: true },
    });

    if (merchant) {
      await notifyNewClaim(claim.id, merchant.userId, listing.title);
    }

    return ok(claim, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "STOCK_UNAVAILABLE") {
      return fail("Requested quantity exceeds available stock", 400);
    }

    throw error;
  }
}
