import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ListingActionPanel } from "@/components/listing-action-panel";
import { mapApiListingToFoodListing } from "@/lib/listing-mapper";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const listingHeroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCwaN1ANrp20nYd1lYAd4bH0IwZHYd4efCypS1yICACQus5e2qalOAttoLEpRKN2HYCAXgPCWjwTQdLm22qb4u0_oBXj3igR0HFqxGmh1b08OBCyBiq-VXdAVEHyU9KfgoO-0Dhh3kjEr9CAbUbkmtz5ftzR5FG_l3lloiGLGxx38zv-nOS3qGnAWMa-_Wb31K5mNTe8I9YGLw52DLLR88Ip-hPGxqUEMP9OAopLMhn7haRDySqfl31ElJIwK7WaEysIj9Ht9kSHp_u";
const mapImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuApz98ilii3rk8JolvpQEVV6os3zrpBUaPYWXYPhmHXLu0zqfWnVznPsUj9DTU6IrZemC6LODu-7qxWaNvWjA5veAfTEpaCqzurPf18bFTUBMseW-qwiVlNdZ1K1bFn3a5MMDusv47hFy26vFAIvBky8L_8XMJRKAFxq96aWd532zBWAQbSxvfZ2qXEKAJkGgAOlj1jL9BQEKSZIUBgmxRbriEw0Qd1XeeQuraUEecuviNZg2okxpoAUJpia9OBvqp1PXhauwF0ZszO";

export default async function ListingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dbListing = await prisma.foodListing.findUnique({
    where: { id },
    include: { merchant: true },
  });

  if (!dbListing || dbListing.merchant.verificationStatus !== "VERIFIED") {
    notFound();
  }

  // Hitung jumlah review untuk merchant ini
  const reviewCount = await prisma.review.count({
    where: { merchantId: dbListing.merchant.id },
  });

  // Ambil review terbaru untuk merchant ini
  const latestReview = await prisma.review.findFirst({
    where: { merchantId: dbListing.merchant.id },
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
  });

  const listing = mapApiListingToFoodListing(dbListing);
  if (listing.type !== "sale") {
    notFound();
  }
  const merchant = {
    id: dbListing.merchant.id,
    name: dbListing.merchant.businessName,
    location: dbListing.merchant.address,
    rating: dbListing.merchant.averageRating,
    reviewCount,
  };

  return (
    <main className="min-h-screen bg-rf-background text-rf-text-onyx">
      <AppHeader
        active="marketplace"
        actions={[{ href: "/", label: "Kembali" }]}
        showSession
      />

      <div className="mx-auto w-full max-w-[1280px] px-5 py-8 md:px-16 md:py-12">
        <div className="mb-8">
          <Link className="group flex items-center gap-2 text-rf-text-muted transition-colors hover:text-rf-primary" href="/">
            <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">
              arrow_back
            </span>
            <span className="text-sm font-semibold">Back to Listings</span>
          </Link>
        </div>

        <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-8 lg:col-span-8">
            <div className="group relative h-80 w-full overflow-hidden rounded-[1.5rem] bg-rf-surface shadow-[0px_10px_30px_rgba(0,0,0,0.04)] md:h-[400px]">
              <Image
                src={listingHeroImage || listing.imageUrl}
                alt={listing.title}
                width={1280}
                height={760}
                priority
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-rf-primary-container px-4 py-1.5 text-xs font-bold text-white shadow-md">
                <span className="material-symbols-outlined text-[16px]">loyalty</span>
                Surplus Rescue
              </div>
            </div>

            <div>
              <h1 className="mb-2 font-heading text-2xl font-bold leading-8 tracking-[-0.01em] text-rf-text-onyx md:text-[32px] md:leading-10">
                {listing.title}
              </h1>
              <div className="flex items-center gap-3 text-rf-text-muted">
                <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-rf-surface-container-high shadow-sm">
                  <span className="material-symbols-outlined text-rf-primary">
                    storefront
                  </span>
                </div>
                <div>
                  <p className="font-heading text-xl font-semibold leading-7 text-rf-text-onyx">
                    {merchant.name}
                  </p>
                  <p className="flex items-center gap-1 text-xs font-bold text-rf-text-muted">
                    <span className="material-symbols-outlined text-[14px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    {merchant.rating > 0 ? merchant.rating.toFixed(1) : "No rating"} ({merchant.reviewCount} {merchant.reviewCount === 1 ? "review" : "reviews"})
                  </p>
                </div>
              </div>
            </div>

            <section className="rounded-[1.5rem] bg-rf-surface p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] md:p-8">
              <h2 className="mb-4 font-heading text-xl font-semibold leading-7 text-rf-text-onyx">
                About this Listing
              </h2>
              <p className="mb-6 leading-relaxed text-rf-text-muted">
                {listing.description}
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <InfoPanel icon="info" title="Allergens" text="Gluten, Dairy, Eggs" warning />
                <InfoPanel
                  icon="kitchen"
                  title="Storage"
                  text={`Consume before ${listing.consumeBefore}. Store safely and keep pickup within the listed window.`}
                />
              </div>
            </section>

            <section className="rounded-[1.5rem] bg-rf-surface p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] md:p-8">
              <h2 className="mb-6 font-heading text-xl font-semibold leading-7 text-rf-text-onyx">
                Merchant Rating
              </h2>
              {latestReview ? (
                <div className="relative flex items-start gap-4 rounded-2xl border border-rf-surface-container-high bg-rf-surface-container-low p-4">
                  <div className="absolute -right-3 -top-3 flex size-8 items-center justify-center rounded-full bg-rf-surface text-rf-primary-container shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">
                      format_quote
                    </span>
                  </div>
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-rf-primary-fixed text-rf-primary shadow-sm">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-semibold text-rf-text-onyx">
                        {latestReview.customer.name}
                      </span>
                      <div className="flex text-[14px] text-yellow-500">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span 
                            key={index} 
                            className="material-symbols-outlined"
                            style={{
                              fontVariationSettings: index < latestReview.rating ? "'FILL' 1" : "'FILL' 0"
                            }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm italic text-rf-text-muted">
                      {latestReview.comment || "Review tanpa komentar"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-rf-surface-container-high bg-rf-surface-container-low p-4 text-center">
                  <p className="text-sm text-rf-text-muted">
                    Belum ada review untuk merchant ini
                  </p>
                </div>
              )}
            </section>
          </div>

          <aside className="sticky top-28 lg:col-span-4">
            <div className="flex flex-col gap-6 rounded-[1.5rem] border border-rf-outline-variant/20 bg-rf-surface p-6 shadow-[0px_20px_40px_rgba(21,128,61,0.08)] md:p-8">
              <div className="border-b border-rf-outline-variant/30 pb-6">
                <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-rf-primary/10 px-2.5 py-1 text-xs font-bold text-rf-primary">
                  <span className="material-symbols-outlined text-[14px]">
                    check_circle
                  </span>
                  Available
                </span>
                <div className="font-heading text-[32px] font-bold leading-10 text-rf-text-onyx">
                  {listing.rescuePrice === 0
                    ? "Gratis"
                    : `Rp ${listing.rescuePrice.toLocaleString("id-ID")}`}
                </div>
                {listing.rescuePrice > 0 ? (
                  <div className="text-sm text-rf-text-muted line-through">
                    Est. Value: Rp {listing.originalPrice.toLocaleString("id-ID")}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-4">
                <SidebarItem icon="schedule" label="Pickup Window" value={listing.pickupWindow} />
                <SidebarItem 
                  icon="inventory_2" 
                  label="Available Quantity" 
                  value={`${listing.quantity} items`} 
                />
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined mt-0.5 text-rf-primary">
                    location_on
                  </span>
                  <div className="w-full">
                    <p className="text-sm font-semibold text-rf-text-onyx">
                      Location
                    </p>
                    <p className="mb-3 text-rf-text-muted">{merchant.location}</p>
                    <div className="relative h-32 w-full overflow-hidden rounded-xl bg-rf-surface-container-high">
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-multiply"
                        style={{ backgroundImage: `url('${mapImage}')` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex size-8 animate-bounce items-center justify-center rounded-full border-2 border-white bg-rf-primary text-white shadow-lg">
                          <span className="material-symbols-outlined text-[16px]">
                            store
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <SidebarItem
                  icon="eco"
                  label="Impact"
                  value={`${listing.impactKgCo2}kg CO2 saved`}
                />
              </div>

              <ListingActionPanel listing={listing} />
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function InfoPanel({
  icon,
  title,
  text,
  warning = false,
}: {
  icon: string;
  title: string;
  text: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-rf-surface-container-low p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-rf-text-onyx">
        <span className={`material-symbols-outlined ${warning ? "text-rf-error" : "text-rf-primary"}`}>
          {icon}
        </span>
        {title}
      </h3>
      <p className="text-sm text-rf-text-muted">{text}</p>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="material-symbols-outlined mt-0.5 text-rf-primary">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-rf-text-onyx">{label}</p>
        <p className="text-rf-text-muted">{value}</p>
      </div>
    </div>
  );
}
