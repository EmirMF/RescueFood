import { HomeContent } from "@/components/home-content";
import { mapApiListingToFoodListing } from "@/lib/listing-mapper";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const [listings, completedOrders, partnerMerchants] = await Promise.all([
    prisma.foodListing.findMany({
      where: {
        status: "ACTIVE",
        mode: "SALE",
      },
      include: {
        merchant: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.order.findMany({
      where: {
        status: "COMPLETED",
      },
    }),
    prisma.merchant.count({
      where: {
        verificationStatus: "VERIFIED",
      },
    }),
  ]);
  const listingImpact = listings.reduce(
    (total, listing) => total + listing.impactKgCo2,
    0,
  );
  const mealsRescued = completedOrders.reduce(
    (total, order) => total + order.quantity,
    0,
  );

  return (
    <HomeContent
      impactSummary={{
        co2SavedKg: listingImpact,
        foodSavedKg: listings.reduce(
          (total, listing) => total + listing.quantity,
          0,
        ),
        mealsRescued,
        partnerMerchants,
      }}
      initialListings={listings.map(mapApiListingToFoodListing)}
    />
  );
}
