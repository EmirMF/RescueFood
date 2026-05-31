"use client";

import Link from "next/link";
import { useState } from "react";
import { secureFetch } from "@/lib/secure-fetch";
import type {
  FoodListing,
  Merchant,
  OrderStatus,
  RescueOrder,
} from "@/lib/types";

export function MerchantDashboard({
  initialListings = [],
  initialOrders = [],
  merchantProfile,
}: {
  initialListings?: FoodListing[];
  initialOrders?: RescueOrder[];
  merchantProfile?: Merchant;
}) {
  const merchant = merchantProfile;
  const [orderStatusOverrides, setOrderStatusOverrides] = useState<
    Record<string, OrderStatus>
  >({});
  const merchantListings = initialListings
    .filter((listing) => listing.merchantId === merchant?.id)
    .map((listing) => listing);
  const merchantOrders = initialOrders.filter(
    (order) =>
      order.paymentStatus === "PAID" &&
      merchantListings.some((listing) => listing.id === order.listingId),
  ).map((order) => ({
    ...order,
    status: orderStatusOverrides[order.id] ?? order.status,
  }));
  const activeStock = merchantListings.reduce(
    (total, listing) => total + listing.quantity,
    0,
  );
  const completedOrders = merchantOrders.filter(
    (order) => order.status === "completed",
  ).length;
  const merchantRevenue = merchantOrders.reduce(
    (total, order) => total + Math.max(0, (order.totalPrice ?? 0) - (order.adminFee ?? 0)),
    0,
  );
  const expiringListings = merchantListings
    .filter((listing) => listing.status === "active")
    .slice(0, 2);
  const visibleListings = [...merchantListings].sort((a, b) => {
    if (a.status === "active" && b.status !== "active") {
      return -1;
    }

    if (a.status !== "active" && b.status === "active") {
      return 1;
    }

    return a.title.localeCompare(b.title);
  });

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
    const apiStatus =
      status === "confirmed"
        ? "CONFIRMED"
        : status === "ready_for_pickup"
          ? "READY_FOR_PICKUP"
          : status === "completed"
            ? "COMPLETED"
            : "CANCELLED";
    const response = await secureFetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: apiStatus }),
    });

    if (response.ok) {
      setOrderStatusOverrides((current) => ({ ...current, [orderId]: status }));
    }
  }

  return (
    <div className="flex flex-col gap-20">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-heading text-5xl font-extrabold leading-[56px] tracking-[-0.02em] text-rf-text-onyx">
              Merchant Overview
            </h1>
            <p className="mt-2 text-lg leading-7 tracking-[0.01em] text-rf-text-muted">
              Welcome back, {merchant?.name ?? "Merchant"}. Here&apos;s your impact today.
            </p>
          </div>
          <Link
            href={merchantOrders[0] ? `/merchant/orders/${merchantOrders[0].id}` : "/merchant"}
            className="rf-focus-ring flex scale-95 items-center gap-2 rounded-full bg-rf-primary-container px-8 py-4 font-heading text-xl font-semibold leading-7 text-white shadow-[0px_20px_40px_rgba(21,128,61,0.08)] transition-all hover:bg-rf-primary active:scale-90"
          >
            <span className="material-symbols-outlined">qr_code_scanner</span>
            Validate Pickup
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-4">
          <MetricCard
            icon="inventory_2"
            label="Total Listings"
            value={merchantListings.length}
            detail={`${merchantListings.filter((listing) => listing.status === "active").length} active in your catalog`}
          />
          <MetricCard
            icon="shopping_bag"
            label="Pending Orders"
            value={merchantOrders.length}
            detail="Requires attention soon"
            tone="tertiary"
          />
          <MetricCard
            icon="payments"
            label="Revenue"
            value={`Rp ${merchantRevenue.toLocaleString("id-ID")}`}
            detail="Paid orders, admin fee excluded"
            tone="success"
          />
          <ImpactMetric value={`${activeStock + completedOrders}kg`} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <h2 className="font-heading text-[32px] font-bold leading-10 tracking-[-0.01em] text-rf-text-onyx">
            Incoming Orders
          </h2>
          <div className="flex flex-col gap-4">
            {merchantOrders.length === 0 ? (
              <EmptyPanel text="Belum ada order paid yang perlu divalidasi." />
            ) : (
              merchantOrders.map((order) => {
                const listing = merchantListings.find(
                  (item) => item.id === order.listingId,
                );

                return (
                  <article
                    key={order.id}
                    className="flex flex-col items-start justify-between gap-4 rounded-xl border border-rf-outline-variant/20 bg-white p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-rf-surface-variant text-rf-text-muted">
                        <span className="material-symbols-outlined text-3xl">
                          {listing?.category === "bakery" ? "bakery_dining" : "restaurant"}
                        </span>
                      </div>
                      <div>
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-rf-text-muted">
                            #{order.id.slice(-8).toUpperCase()}
                          </span>
                          <span className={statusClass(order.status)}>
                            {order.status.replaceAll("_", " ")}
                          </span>
                        </div>
                        <h3 className="font-heading text-xl font-semibold leading-7 text-rf-text-onyx">
                          {listing?.title ?? "Order pickup"}
                        </h3>
                        <p className="text-base leading-6 tracking-[0.01em] text-rf-text-muted">
                          Pickup today: {listing?.pickupWindow ?? "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full gap-2 sm:w-auto">
                      <Link
                        href={`/merchant/orders/${order.id}`}
                        className="rf-focus-ring flex-1 rounded-full border border-rf-primary px-4 py-2 text-center text-sm font-semibold text-rf-primary transition-colors hover:bg-rf-surface-container-low sm:flex-none"
                      >
                        Review
                      </Link>
                      <QueueButton
                        label="Ready"
                        onClick={() => updateOrderStatus(order.id, "ready_for_pickup")}
                      />
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <h2 className="font-heading text-[32px] font-bold leading-10 tracking-[-0.01em] text-rf-text-onyx">
            Expiring Soon
          </h2>
          <div className="flex flex-col gap-4 rounded-xl border border-rf-outline-variant/20 bg-rf-surface-container-low p-6">
            {expiringListings.length === 0 ? (
              <EmptyPanel text="Tidak ada listing aktif yang mendekati batas pickup." compact />
            ) : (
              expiringListings.map((listing, index) => (
                <article
                  key={listing.id}
                  className="flex items-start gap-4 rounded-lg border border-rf-outline-variant/10 bg-white p-4 shadow-sm"
                >
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-rf-primary-fixed text-rf-primary">
                    <span className="material-symbols-outlined text-3xl">
                      {listing.category === "bakery" ? "bakery_dining" : "restaurant"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="mb-1 flex items-center gap-1 text-xs font-bold text-rf-error">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {index === 0 ? "2 hours left" : "4 hours left"}
                    </span>
                    <h4 className="font-heading text-base font-semibold text-rf-text-onyx">
                      {listing.title}
                    </h4>
                    <span className="text-sm text-rf-text-muted">
                      {listing.quantity} items remaining
                    </span>
                    <Link
                      href={`/merchant/listings/${listing.id}/edit`}
                      className="mt-2 w-fit rounded-full text-sm font-semibold text-rf-primary hover:underline"
                    >
                      Edit listing
                    </Link>
                  </div>
                </article>
              ))
            )}
            <a
              href="#all-listings"
              className="mt-2 flex w-full items-center justify-center gap-1 text-sm font-semibold text-rf-primary hover:underline"
            >
              View all listings
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </div>
        </aside>
      </section>

      <section id="all-listings" className="scroll-mt-28 flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2 className="font-heading text-[32px] font-bold leading-10 tracking-[-0.01em] text-rf-text-onyx">
              All Listings
            </h2>
            <p className="mt-1 text-base leading-6 tracking-[0.01em] text-rf-text-muted">
              Semua listing milik merchant ini, termasuk aktif, habis, expired,
              dan removed.
            </p>
          </div>
          {merchant?.verified && (
            <Link
              href="/merchant/listings/new"
              className="rf-focus-ring inline-flex w-fit items-center justify-center gap-2 rounded-full bg-rf-primary-container px-5 py-3 text-sm font-extrabold text-white transition hover:bg-rf-primary"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Listing baru
            </Link>
          )}
        </div>

        {visibleListings.length === 0 ? (
          <EmptyPanel text="Belum ada listing. Buat listing pertama untuk mulai menerima order." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-rf-outline-variant/20 bg-white shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
            <div className="hidden grid-cols-[1.5fr_110px_110px_130px_120px] gap-4 border-b border-rf-outline-variant/20 bg-rf-surface-container-low px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-rf-text-muted md:grid">
              <span>Listing</span>
              <span>Status</span>
              <span>Stock</span>
              <span>Harga</span>
              <span className="text-right">Action</span>
            </div>
            <div className="divide-y divide-rf-outline-variant/20">
              {visibleListings.map((listing) => (
                <article
                  key={listing.id}
                  className="grid gap-4 px-5 py-4 md:grid-cols-[1.5fr_110px_110px_130px_120px] md:items-center"
                >
                  <div className="min-w-0">
                    <h3 className="truncate font-heading text-xl font-semibold leading-7 text-rf-text-onyx">
                      {listing.title}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-rf-text-muted">
                      {listing.category.replaceAll("_", " ")} · {listing.pickupWindow}
                    </p>
                  </div>
                  <span className={listingStatusClass(listing.status)}>
                    {listing.status.replaceAll("_", " ")}
                  </span>
                  <span className="text-sm font-extrabold text-rf-text-onyx">
                    {listing.quantity} item
                  </span>
                  <span className="text-sm font-extrabold text-rf-primary">
                    Rp {listing.rescuePrice.toLocaleString("id-ID")}
                  </span>
                  <div className="flex justify-start gap-2 md:justify-end">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="rf-focus-ring rounded-full border border-rf-outline-variant px-3 py-2 text-xs font-extrabold text-rf-primary transition hover:bg-rf-surface-container-low"
                    >
                      View
                    </Link>
                    <Link
                      href={`/merchant/listings/${listing.id}/edit`}
                      className="rf-focus-ring rounded-full bg-rf-primary-container px-3 py-2 text-xs font-extrabold text-white transition hover:bg-rf-primary"
                    >
                      Edit
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function QueueButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
      className="rf-focus-ring rounded-rf-control border border-rf-outline-variant px-3 py-2 text-xs font-extrabold text-rf-primary"
    >
      {label}
    </button>
  );
}

function MetricCard({
  detail,
  icon,
  label,
  tone = "primary",
  value,
}: {
  detail: string;
  icon: string;
  label: string;
  tone?: "primary" | "tertiary" | "success";
  value: string | number;
}) {
  const toneClass =
    tone === "tertiary"
      ? "text-rf-tertiary"
      : tone === "success"
        ? "text-rf-success"
        : "text-rf-primary";

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-rf-outline-variant/20 bg-white p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
      <div className={`flex items-center gap-2 ${toneClass}`}>
        <span className="material-symbols-outlined">{icon}</span>
        <span className="text-sm font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span className="font-heading text-5xl font-extrabold leading-[56px] tracking-[-0.02em] text-rf-text-onyx">
        {value}
      </span>
      <span className="text-base leading-6 tracking-[0.01em] text-rf-text-muted">
        {detail}
      </span>
    </div>
  );
}

function ImpactMetric({ value }: { value: string | number }) {
  return (
    <div className="relative flex flex-col gap-2 overflow-hidden rounded-xl bg-rf-primary-container p-6 text-white shadow-[0px_20px_40px_rgba(21,128,61,0.08)]">
      <div className="absolute -bottom-4 -right-4 opacity-10">
        <span className="material-symbols-outlined text-[120px]">eco</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined">public</span>
        <span className="text-sm font-semibold uppercase tracking-wider">
          Total Impact
        </span>
      </div>
      <span className="font-heading text-5xl font-extrabold leading-[56px] tracking-[-0.02em]">
        {value}
      </span>
      <span className="text-base leading-6 tracking-[0.01em] opacity-90">
        CO2 Saved this month
      </span>
    </div>
  );
}

function EmptyPanel({
  compact = false,
  text,
}: {
  compact?: boolean;
  text: string;
}) {
  return (
    <div
      className={`rounded-xl border border-dashed border-rf-outline-variant/50 bg-white text-center text-sm font-semibold text-rf-text-muted ${
        compact ? "p-4" : "p-6"
      }`}
    >
      {text}
    </div>
  );
}

function statusClass(status: OrderStatus) {
  const base = "rounded-full px-2 py-0.5 text-xs font-semibold capitalize";

  if (status === "pending") {
    return `${base} bg-rf-error-container text-rf-error`;
  }

  if (status === "confirmed" || status === "ready_for_pickup") {
    return `${base} bg-rf-tertiary-container text-white`;
  }

  return `${base} bg-rf-primary-fixed text-rf-primary`;
}

function listingStatusClass(status: FoodListing["status"]) {
  const base = "w-fit rounded-full px-3 py-1 text-xs font-extrabold capitalize";

  if (status === "active") {
    return `${base} bg-rf-primary-fixed text-rf-primary`;
  }

  if (status === "sold_out") {
    return `${base} bg-rf-secondary-fixed text-rf-secondary`;
  }

  if (status === "removed") {
    return `${base} bg-rf-error-container text-rf-error`;
  }

  return `${base} bg-rf-surface-container text-rf-text-muted`;
}
