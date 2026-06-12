import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-response";
import { calculateDynamicPrice } from "@/lib/dynamic-pricing";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const listing = await prisma.foodListing.findUnique({
    where: { id },
    include: {
      merchant: true,
    },
  });

  if (!listing || listing.merchant.verificationStatus !== "VERIFIED") {
    return fail("Listing not found", 404);
  }

  const { currentPrice, platformFee } = calculateDynamicPrice(
    listing.originalPrice,
    listing.floorPrice,
    listing.pickupStartTime,
    listing.pickupEndTime,
    listing.viewCount,
  );

  return ok({ ...listing, currentPrice, platformFee });
}

function toListingStatus(status: unknown) {
  if (status === "ACTIVE") {
    return "ACTIVE";
  }

  if (status === "SOLD_OUT") {
    return "SOLD_OUT";
  }

  if (status === "EXPIRED") {
    return "EXPIRED";
  }

  if (status === "REMOVED") {
    return "REMOVED";
  }

  if (status === "DRAFT") {
    return "DRAFT";
  }

  return null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Login is required", 401);
  }

  if (currentUser.role !== "MERCHANT" || !currentUser.merchantId) {
    return fail("Only merchants can update listings", 403);
  }

  const merchant = await prisma.merchant.findUnique({
    where: {
      id: currentUser.merchantId,
    },
    select: {
      verificationStatus: true,
    },
  });

  if (merchant?.verificationStatus !== "VERIFIED") {
    return fail("Merchant must be verified before updating listings", 403);
  }

  const { id } = await params;
  const body = await request.json();
  const status = body.status ? toListingStatus(body.status) : undefined;

  if (body.status && !status) {
    return fail("Unsupported listing status");
  }

  const listing = await prisma.foodListing.findFirst({
    where: {
      id,
      merchantId: currentUser.merchantId,
    },
  });

  if (!listing) {
    return fail("Listing not found", 404);
  }

  const updatedListing = await prisma.foodListing.update({
    where: {
      id,
    },
    data: {
      ...(typeof body.title === "string" ? { title: body.title } : {}),
      ...(typeof body.description === "string"
        ? { description: body.description }
        : {}),
      ...(typeof body.category === "string" ? { category: body.category } : {}),
      ...(typeof body.originalPrice === "number"
        ? { originalPrice: body.originalPrice }
        : {}),
      ...(typeof body.discountedPrice === "number"
        ? { discountedPrice: body.discountedPrice }
        : {}),
      ...(typeof body.floorPrice === "number"
        ? { floorPrice: body.floorPrice }
        : {}),
      ...(Array.isArray(body.allergenTags)
        ? { allergenTags: body.allergenTags.filter((t: unknown) => typeof t === "string") }
        : {}),
      ...(typeof body.quantity === "number" ? { quantity: body.quantity } : {}),
      ...(body.mode === "SALE" || body.mode === "DONATION"
        ? { mode: body.mode }
        : {}),
      ...(typeof body.pickupLocation === "string"
        ? { pickupLocation: body.pickupLocation }
        : {}),
      ...(typeof body.pickupLatitude === "number"
        ? { pickupLatitude: body.pickupLatitude }
        : {}),
      ...(typeof body.pickupLongitude === "number"
        ? { pickupLongitude: body.pickupLongitude }
        : {}),
      ...(typeof body.pickupStartTime === "string"
        ? { pickupStartTime: new Date(body.pickupStartTime) }
        : {}),
      ...(typeof body.pickupEndTime === "string"
        ? { pickupEndTime: new Date(body.pickupEndTime) }
        : {}),
      ...(typeof body.consumeBefore === "string"
        ? { consumeBefore: new Date(body.consumeBefore) }
        : {}),
      ...(typeof body.imageUrl === "string" ? { imageUrl: body.imageUrl } : {}),
      ...(typeof body.impactKgCo2 === "number"
        ? { impactKgCo2: body.impactKgCo2 }
        : {}),
      ...(status ? { status } : {}),
    },
    include: {
      merchant: true,
    },
  });

  return ok(updatedListing);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Login is required", 401);
  }

  if (currentUser.role !== "MERCHANT" || !currentUser.merchantId) {
    return fail("Only merchants can remove listings", 403);
  }

  const merchant = await prisma.merchant.findUnique({
    where: {
      id: currentUser.merchantId,
    },
    select: {
      verificationStatus: true,
    },
  });

  if (merchant?.verificationStatus !== "VERIFIED") {
    return fail("Merchant must be verified before removing listings", 403);
  }

  const { id } = await params;
  const listing = await prisma.foodListing.findFirst({
    where: {
      id,
      merchantId: currentUser.merchantId,
    },
  });

  if (!listing) {
    return fail("Listing not found", 404);
  }

  const updatedListing = await prisma.foodListing.update({
    where: {
      id,
    },
    data: {
      status: "REMOVED",
    },
    include: {
      merchant: true,
    },
  });

  return ok(updatedListing);
}
