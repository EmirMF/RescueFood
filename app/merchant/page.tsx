import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { MerchantDashboard } from "@/components/merchant-dashboard";
import { mapApiListingToFoodListing } from "@/lib/listing-mapper";
import { mapApiOrderToRescueOrder } from "@/lib/order-mapper";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/route-guards";

export const dynamic = "force-dynamic";

export default async function MerchantDashboardPage() {
  const currentUser = await requireRole("MERCHANT");

  const dbMerchant = await prisma.merchant.findFirst({
    where: currentUser?.merchantId
      ? {
          id: currentUser.merchantId,
        }
      : undefined,
    include: {
      listings: {
        include: {
          merchant: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      orders: {
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
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  const merchant = dbMerchant
    ? {
        id: dbMerchant.id,
        name: dbMerchant.businessName,
        category: "Merchant",
        location: dbMerchant.address,
        distanceKm: 0,
        rating: dbMerchant.averageRating,
        verified: dbMerchant.verificationStatus === "VERIFIED",
        verificationStatus: dbMerchant.verificationStatus,
        latitude: dbMerchant.latitude,
        longitude: dbMerchant.longitude,
      }
    : undefined;

  if (!merchant) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <AppHeader
        active="merchant"
        actions={[
          { href: "/profile", label: "Profil" },
          ...(merchant.verified
            ? [
                {
                  href: "/merchant/listings/new",
                  label: "Listing baru",
                  variant: "primary" as const,
                },
              ]
            : []),
        ]}
      />

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
              Merchant dashboard
            </p>
            <h1 className="mt-2 text-4xl font-black leading-tight text-rf-text-onyx">
              {merchant.name}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-rf-text-muted">
              Pantau listing surplus, status order, dan pickup yang perlu
              divalidasi. Listing dan order backend akan muncul otomatis saat
              memakai session merchant.
            </p>
          </div>
          <span className="w-fit rounded-full bg-rf-primary-fixed px-4 py-2 text-sm font-extrabold text-rf-primary">
            {merchant.verified
              ? "Verified merchant"
              : merchant.verificationStatus === "REJECTED"
                ? "Rejected merchant"
                : "Pending verification"}
          </span>
        </div>

        {!merchant.verified && (
          <div className="mb-8 rounded-rf-card border border-rf-secondary-container/40 bg-rf-secondary-fixed p-5 text-rf-secondary shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
            <p className="text-sm font-extrabold uppercase tracking-wider">
              Listing locked
            </p>
            <h2 className="mt-1 text-2xl font-black text-rf-text-onyx">
              Merchant harus diverifikasi sebelum publikasi listing.
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-rf-text-muted">
              Status dari admin sekarang langsung mempengaruhi merchant. Jika
              pending atau rejected, merchant tetap bisa melihat dashboard, tapi
              tidak bisa membuat, mengubah, atau mempublikasikan listing.
            </p>
          </div>
        )}

        <MerchantDashboard
          initialListings={
            dbMerchant?.listings.map(mapApiListingToFoodListing) ?? []
          }
          initialOrders={dbMerchant?.orders.map(mapApiOrderToRescueOrder) ?? []}
          merchantProfile={merchant}
        />
      </section>
    </main>
  );
}
