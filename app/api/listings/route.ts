import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-response";

export async function GET() {
  const listings = await prisma.foodListing.findMany({
    where: {
      status: "ACTIVE",
      merchant: {
        verificationStatus: "VERIFIED",
      },
    },
    include: {
      merchant: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return ok(listings);
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Login is required", 401);
  }

  if (currentUser.role !== "MERCHANT" || !currentUser.merchantId) {
    return fail("Only merchants can create listings", 403);
  }

  const merchant = await prisma.merchant.findUnique({
    where: {
      id: currentUser.merchantId,
    },
    select: {
      verificationStatus: true,
      address: true,
      latitude: true,
      longitude: true,
    },
  });

  if (merchant?.verificationStatus !== "VERIFIED") {
    return fail("Merchant must be verified before creating listings", 403);
  }

  const body = await request.json();

  if (!body.title || !body.pickupStartTime || !body.pickupEndTime) {
    return fail("title, pickupStartTime, and pickupEndTime are required");
  }

  const listing = await prisma.foodListing.create({
    data: {
      merchantId: currentUser.merchantId,
      title: body.title,
      description: body.description ?? "",
      category: body.category ?? "other",
      imageUrl: body.imageUrl ?? "",
      originalPrice: Number(body.originalPrice ?? 0),
      discountedPrice: Number(body.discountedPrice ?? 0),
      quantity: Number(body.quantity ?? 1),
      mode: body.mode === "DONATION" ? "DONATION" : "SALE",
      pickupLocation: body.pickupLocation ?? merchant.address,
      pickupLatitude:
        typeof body.pickupLatitude === "number"
          ? body.pickupLatitude
          : merchant.latitude,
      pickupLongitude:
        typeof body.pickupLongitude === "number"
          ? body.pickupLongitude
          : merchant.longitude,
      pickupStartTime: new Date(body.pickupStartTime),
      pickupEndTime: new Date(body.pickupEndTime),
      consumeBefore: new Date(body.consumeBefore ?? body.pickupEndTime),
      allergenInfo: body.allergenInfo ?? null,
      impactKgCo2: Number(body.impactKgCo2 ?? 0),
      status: "ACTIVE",
    },
    include: {
      merchant: true,
    },
  });

  return ok(listing, { status: 201 });
}
