import { AppHeader } from "@/components/app-header";
import { ImpactReport } from "@/components/impact-report";
import { mapApiListingToFoodListing } from "@/lib/listing-mapper";
import { mapApiOrderToRescueOrder } from "@/lib/order-mapper";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ImpactPage() {
  const [listings, orders, merchantCount] = await Promise.all([
    prisma.foodListing.findMany({
      where: {
        mode: "SALE",
        merchant: {
          verificationStatus: "VERIFIED",
        },
      },
      include: {
        merchant: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.order.findMany({
      include: {
        customer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.merchant.count({
      where: {
        verificationStatus: "VERIFIED",
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <AppHeader active="impact" actions={[{ href: "/", label: "Marketplace" }]} />

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <div className="mb-8">
          <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
            Impact report
          </p>
          <h1 className="mt-2 text-4xl font-black leading-tight text-rf-text-onyx">
            Dampak makanan terselamatkan.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-rf-text-muted">
            Pantau estimasi makanan, CO2, dan kontribusi merchant dari flow
            marketplace RescueFood.
          </p>
        </div>

        <ImpactReport
          initialListings={listings.map(mapApiListingToFoodListing)}
          initialMerchantCount={merchantCount}
          initialOrders={orders.map(mapApiOrderToRescueOrder)}
        />
      </section>
    </main>
  );
}
