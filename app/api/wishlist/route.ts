import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { calculateDynamicPrice } from "@/lib/dynamic-pricing";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Unauthorized", 401);
  }

  const wishlists = await prisma.wishlist.findMany({
    where: {
      userId: currentUser.id,
    },
    include: {
      listing: {
        include: {
          merchant: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const enriched = wishlists.map((w) => {
    const { currentPrice, platformFee } = calculateDynamicPrice(
      w.listing.originalPrice,
      w.listing.floorPrice,
      w.listing.pickupStartTime,
      w.listing.pickupEndTime,
      w.listing.viewCount,
    );
    return { ...w, listing: { ...w.listing, currentPrice, platformFee } };
  });

  return ok(enriched);
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Unauthorized", 401);
  }

  const body = await request.json();
  const { listingId } = body;

  if (!listingId) {
    return fail("listingId is required");
  }

  // Check if listing exists
  const listing = await prisma.foodListing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    return fail("Listing not found", 404);
  }

  // Check if already in wishlist
  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_listingId: {
        userId: currentUser.id,
        listingId,
      },
    },
  });

  if (existing) {
    return fail("Already in wishlist", 409);
  }

  const wishlist = await prisma.wishlist.create({
    data: {
      userId: currentUser.id,
      listingId,
    },
    include: {
      listing: {
        include: {
          merchant: true,
        },
      },
    },
  });

  return ok(wishlist, { status: 201 });
}
