import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-response";
import { haversineKm } from "@/lib/haversine";

const RADIUS_KM = 5;

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function randomPickupCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return fail("Login is required", 401);

  const body = await request.json();
  const userLat = typeof body.latitude === "number" ? body.latitude : null;
  const userLng = typeof body.longitude === "number" ? body.longitude : null;

  if (userLat === null || userLng === null) {
    return fail("latitude and longitude required", 400);
  }

  await prisma.user.update({
    where: { id: currentUser.id },
    data: { latitude: userLat, longitude: userLng },
  });

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { subscriptionStatus: true, dietaryPreferences: true },
  });

  if (user?.subscriptionStatus !== "active") {
    return fail("No active subscription", 403);
  }

  const today = todayString();
  const existing = await prisma.subscriptionAssignment.findUnique({
    where: { userId_date: { userId: currentUser.id, date: today } },
    include: { listing: { include: { merchant: true } }, order: true },
  });

  if (existing) {
    return ok({ assignment: existing, isNew: false });
  }

  const listings = await prisma.foodListing.findMany({
    where: {
      status: "ACTIVE",
      mode: "SALE",
      quantity: { gt: 0 },
      merchant: { verificationStatus: "VERIFIED" },
    },
    include: { merchant: true },
  });

  const prefs = new Set(
    (user.dietaryPreferences ?? []).map((p) => p.toLowerCase()),
  );

  const nearby = listings
    .map((listing) => {
      const lat = listing.pickupLatitude ?? listing.merchant.latitude;
      const lng = listing.pickupLongitude ?? listing.merchant.longitude;
      if (!lat || !lng) return null;
      const distKm = haversineKm(userLat, userLng, lat, lng);
      if (distKm > RADIUS_KM) return null;
      const safe = listing.allergenTags.every((tag) => !prefs.has(tag.toLowerCase()));
      if (!safe) return null;
      return { listing, distKm };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.distKm - b.distKm);

  if (nearby.length === 0) {
    return fail("No available packages within 5km matching your dietary preferences", 404);
  }

  const { listing } = nearby[0];

  const result = await prisma.$transaction(async (tx) => {
    await tx.foodListing.update({
      where: { id: listing.id },
      data: {
        quantity: { decrement: 1 },
        status: listing.quantity - 1 <= 0 ? "SOLD_OUT" : undefined,
      },
    });

    const order = await tx.order.create({
      data: {
        customerId: currentUser.id,
        listingId: listing.id,
        merchantId: listing.merchantId,
        quantity: 1,
        adminFee: 0,
        totalPrice: 0,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        isSubscriptionOrder: true,
        pickupCode: randomPickupCode(),
      },
    });

    const assignment = await tx.subscriptionAssignment.create({
      data: {
        userId: currentUser.id,
        listingId: listing.id,
        orderId: order.id,
        date: today,
      },
    });

    return { assignment, order };
  });

  return ok({
    assignment: result.assignment,
    order: result.order,
    listing: {
      id: listing.id,
      title: listing.title,
      merchantName: listing.merchant.businessName,
      pickupLocation: listing.pickupLocation,
    },
    isNew: true,
  });
}
