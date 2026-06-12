import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-response";
import { calculateDynamicPrice } from "@/lib/dynamic-pricing";
import { estimateCo2SavedGrams } from "@/lib/co2-estimator";

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

  const enriched = listings.map((listing) => {
    const { currentPrice, platformFee } = calculateDynamicPrice(
      listing.originalPrice,
      listing.floorPrice,
      listing.pickupStartTime,
      listing.pickupEndTime,
      listing.viewCount,
    );
    return { ...listing, currentPrice, platformFee };
  });

  return ok(enriched);
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

  const allergenTags: string[] = Array.isArray(body.allergenTags)
    ? body.allergenTags.filter((t: unknown) => typeof t === "string")
    : [];

  const co2SavedGrams = await estimateCo2SavedGrams(
    body.title ?? "",
    body.category ?? "snack",
    Number(body.quantity ?? 1),
  );

  const listing = await prisma.foodListing.create({
    data: {
      merchantId: currentUser.merchantId,
      title: body.title,
      description: body.description ?? "",
      category: body.category ?? "other",
      imageUrl: body.imageUrl ?? "",
      originalPrice: Number(body.originalPrice ?? 0),
      discountedPrice: Number(body.discountedPrice ?? 0),
      floorPrice: Number(body.floorPrice ?? 0),
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
      allergenTags,
      impactKgCo2: Math.round(co2SavedGrams / 1000),
      co2SavedGrams,
      status: "ACTIVE",
    },
    include: {
      merchant: true,
    },
  });

  return ok(listing, { status: 201 });
}
