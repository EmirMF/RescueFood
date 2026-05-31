import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { NewListingForm } from "@/components/new-listing-form";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/route-guards";
import type { FoodCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

function toFoodCategory(category: string): FoodCategory {
  if (
    category === "bakery" ||
    category === "rice_meal" ||
    category === "produce" ||
    category === "vegetarian" ||
    category === "snack" ||
    category === "beverage"
  ) {
    return category;
  }

  return "snack";
}

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const currentUser = await requireRole("MERCHANT");

  if (!currentUser.merchantId) {
    notFound();
  }

  const { id } = await params;
  const listing = await prisma.foodListing.findFirst({
    where: {
      id,
      merchantId: currentUser.merchantId,
    },
  });

  if (!listing) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <AppHeader
        active="merchant"
        actions={[{ href: "/merchant", label: "Dashboard" }]}
      />

      <section className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-12">
        <div className="mb-6">
          <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
            Edit listing
          </p>
          <h1 className="mt-2 text-4xl font-black leading-tight text-rf-text-onyx">
            Perbarui detail surplus makanan
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-rf-text-muted">
            Update detail listing, harga, stok, foto, impact, dan safety window
            langsung ke database.
          </p>
        </div>

        <NewListingForm
          merchantId={currentUser.merchantId}
          mode="edit"
          initialValues={{
            id: listing.id,
            title: listing.title,
            category: toFoodCategory(listing.category),
            description: listing.description,
            listingType: "sale",
            originalPrice: listing.originalPrice,
            rescuePrice: listing.discountedPrice,
            quantity: listing.quantity,
            pickupStartTime: listing.pickupStartTime,
            pickupEndTime: listing.pickupEndTime,
            consumeBefore: listing.consumeBefore,
            imageUrl: listing.imageUrl,
            impactKgCo2: listing.impactKgCo2,
            pickupLocation: listing.pickupLocation,
            pickupLatitude: listing.pickupLatitude,
            pickupLongitude: listing.pickupLongitude,
            allergenInfo: listing.allergenInfo,
          }}
        />
      </section>
    </main>
  );
}
