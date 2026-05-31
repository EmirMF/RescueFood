import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { ProfileContent } from "@/components/profile-content";
import { getCurrentUser } from "@/lib/auth";
import { mapApiListingToFoodListing } from "@/lib/listing-mapper";
import { mapApiOrderToRescueOrder } from "@/lib/order-mapper";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/lib/types";

export const dynamic = "force-dynamic";

function toClientRole(role?: string): UserRole {
  if (role === "MERCHANT") {
    return "merchant";
  }

  if (role === "ADMIN") {
    return "admin";
  }

  return "customer";
}

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();
  const [orders, merchant] = await Promise.all([
    currentUser
      ? prisma.order.findMany({
          where:
            currentUser.role === "CUSTOMER"
              ? { customerId: currentUser.id }
              : currentUser.merchantId
                ? { merchantId: currentUser.merchantId }
                : { id: "__none__" },
          include: {
            customer: {
              select: {
                name: true,
              },
            },
            listing: {
              include: {
                merchant: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      : Promise.resolve([]),
    currentUser?.merchantId
      ? prisma.merchant.findUnique({
          where: {
            id: currentUser.merchantId,
          },
          include: {
            listings: {
              include: {
                merchant: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        })
      : Promise.resolve(null),
  ]);
  const listingMap = new Map(
    [
      ...orders.map((order) => order.listing),
      ...(merchant?.listings ?? []),
    ].map((listing) => [listing.id, mapApiListingToFoodListing(listing)]),
  );
  const merchantProfile = merchant
    ? {
        id: merchant.id,
        name: merchant.businessName,
        category: "Merchant",
        location: merchant.address,
        distanceKm: 0,
        rating: merchant.averageRating,
        verified: merchant.verificationStatus === "VERIFIED",
        latitude: merchant.latitude,
        longitude: merchant.longitude,
      }
    : undefined;

  return (
    <main className="min-h-screen bg-rf-background text-rf-text-onyx">
      <AppHeader showSession />

      <section className="mx-auto w-full max-w-[1280px] px-5 py-12 md:px-16 md:py-16">
        <header className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
              Account center
            </p>
            <h1 className="mt-2 font-heading text-5xl font-extrabold leading-[56px] tracking-[-0.02em] text-rf-text-onyx">
              My Account
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-7 tracking-[0.01em] text-rf-text-muted">
              Manage your details, view past orders, and track your contribution
              to reducing food waste.
            </p>
          </div>
          <Link
            href="/auth"
            className="rf-focus-ring inline-flex w-fit items-center justify-center gap-2 rounded-full border border-rf-primary px-5 py-3 text-sm font-extrabold text-rf-primary transition hover:bg-rf-surface-container-low"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            Ganti akun
          </Link>
        </header>

        <ProfileContent
          initialListings={[...listingMap.values()]}
          initialMerchant={merchantProfile}
          initialOrders={orders.map(mapApiOrderToRescueOrder)}
          profile={{
            email: currentUser?.email ?? "Belum login",
            name: currentUser?.name ?? "Guest Customer",
          }}
          role={toClientRole(currentUser?.role)}
        />
      </section>
    </main>
  );
}
