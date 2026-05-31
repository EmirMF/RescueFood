"use client";

import Link from "next/link";
import type { FoodListing, RescueOrder } from "@/lib/types";

export function ImpactReport({
  initialListings = [],
  initialMerchantCount = 0,
  initialOrders = [],
}: {
  initialListings?: FoodListing[];
  initialMerchantCount?: number;
  initialOrders?: RescueOrder[];
}) {
  const listings = initialListings;
  const orders = initialOrders;
  const completedOrders = orders.filter((order) => order.status === "completed");
  const listedImpact = listings.reduce(
    (total, listing) => total + listing.impactKgCo2,
    0,
  );
  const localMeals = completedOrders.reduce(
    (total, order) => total + order.quantity,
    0,
  );

  const metrics = [
    {
      label: "Meals rescued",
      value: localMeals,
      detail: "Completed customer pickups",
    },
    {
      label: "Food saved",
      value: `${listings.reduce((total, listing) => total + listing.quantity, 0)}kg`,
      detail: "Estimated surplus weight",
    },
    {
      label: "CO2 reduced",
      value: `${listedImpact}kg`,
      detail: "Based on listing impact estimates",
    },
    {
      label: "Partner merchants",
      value: initialMerchantCount,
      detail: "Verified and pilot partners",
    },
  ];

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-rf-card bg-rf-surface-base p-5 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]"
          >
            <p className="text-3xl font-black text-rf-primary">
              {metric.value}
            </p>
            <p className="mt-1 text-sm font-extrabold text-rf-text-onyx">
              {metric.label}
            </p>
            <p className="mt-2 text-xs font-semibold leading-5 text-rf-text-muted">
              {metric.detail}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-rf-card bg-rf-surface-base p-5 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
            Impact sources
          </p>
          <h2 className="mt-1 text-2xl font-black text-rf-text-onyx">
            Kontribusi dari marketplace
          </h2>
          <div className="mt-5 grid gap-3">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="rf-focus-ring rounded-rf-control bg-rf-surface-container-low p-4 transition hover:bg-rf-surface-container"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-black text-rf-text-onyx">
                      {listing.title}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-rf-text-muted">
                      Diskon · {listing.quantity} tersedia
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-rf-primary-fixed px-3 py-1 text-xs font-extrabold text-rf-primary">
                    {listing.impactKgCo2}kg CO2
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-rf-card bg-rf-surface-base p-5 shadow-[0px_20px_40px_rgba(21,128,61,0.08)]">
          <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
            Report status
          </p>
          <h2 className="mt-1 text-2xl font-black text-rf-text-onyx">
            Status prototype
          </h2>
          <div className="mt-5 grid gap-3">
            <MiniMetric label="Completed pickups" value={completedOrders.length} />
            <MiniMetric label="Active listings" value={listings.length} />
          </div>
          <p className="mt-5 rounded-rf-control bg-rf-surface-container-low p-4 text-sm font-semibold leading-6 text-rf-text-muted">
            Angka impact dihitung dari listing, order, dan merchant
            terverifikasi di database.
          </p>
        </aside>
      </section>

      <section className="rounded-rf-card bg-rf-surface-base p-5 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
        <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
          Report narrative
        </p>
        <h2 className="mt-1 text-2xl font-black text-rf-text-onyx">
          Bagaimana dampak dihitung
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <ReportStep
            title="1. Listing impact"
            text="Setiap listing membawa estimasi CO2 yang terselamatkan."
          />
          <ReportStep
            title="2. Pickup completion"
            text="Order selesai menambah jumlah meals rescued."
          />
        </div>
      </section>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-rf-control bg-rf-surface-container-low p-4">
      <p className="text-2xl font-black text-rf-primary">{value}</p>
      <p className="mt-1 text-sm font-bold text-rf-text-muted">{label}</p>
    </div>
  );
}

function ReportStep({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-rf-control bg-rf-surface-container-low p-4">
      <p className="font-black text-rf-primary">{title}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-rf-text-muted">
        {text}
      </p>
    </div>
  );
}
