"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useEffect } from "react";
import { roleLabels } from "@/lib/session";
import type { FoodListing, Merchant, RescueOrder, UserRole } from "@/lib/types";
import { MerchantLocationPicker } from "@/components/merchant-location-picker";
import { ReviewModal } from "./review-modal";
import { secureFetch } from "@/lib/secure-fetch";

type Review = {
  id: string;
  orderId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  order: {
    id: string;
    listing: {
      title: string;
      merchantName: string;
    };
  };
};

type ProfileTab = "profile" | "orders" | "reviews";

const bandungPinpoint = {
  latitude: "-6.917464",
  longitude: "107.619125",
};

type ProfileContentProps = {
  initialListings?: FoodListing[];
  initialMerchant?: Merchant;
  initialOrders?: RescueOrder[];
  profile: {
    email: string;
    name: string;
  };
  role: UserRole;
};

export function ProfileContent({
  initialListings = [],
  initialMerchant,
  initialOrders = [],
  profile,
  role,
}: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const completedOrders = initialOrders.filter(
    (order) => order.status === "completed",
  );
  const foodRescued = completedOrders.reduce(
    (total, order) => total + order.quantity,
    0,
  );
  const co2Saved = completedOrders.reduce((total, order) => {
    const listing = initialListings.find((item) => item.id === order.listingId);
    return total + (listing?.impactKgCo2 ?? 0);
  }, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="lg:sticky lg:top-28 lg:h-fit">
        <div className="rounded-xl bg-rf-surface-base p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
          <nav className="grid gap-2">
            <TabButton
              active={activeTab === "profile"}
              icon="person"
              label="Profile Information"
              onClick={() => setActiveTab("profile")}
            />
            <TabButton
              active={activeTab === "orders"}
              icon="receipt_long"
              label={role === "merchant" ? "Pickup History" : "Order History"}
              onClick={() => setActiveTab("orders")}
            />
            <TabButton
              active={activeTab === "reviews"}
              icon="rate_review"
              label="My Reviews"
              onClick={() => setActiveTab("reviews")}
            />
          </nav>

          <div className="mt-8 border-t border-rf-outline-variant/30 pt-8">
            <h3 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-rf-text-muted">
              Your Impact
            </h3>
            <ImpactLine icon="compost" label="Food Rescued" value={`${foodRescued}kg`} />
            <ImpactLine icon="co2" label="CO2 Saved" value={`${co2Saved}kg`} />
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        {activeTab === "profile" && (
          <ProfilePanel
            merchant={initialMerchant}
            profile={profile}
            role={role}
          />
        )}
        {activeTab === "orders" && (
          <HistoryPanel
            listings={initialListings}
            orders={initialOrders}
            role={role}
          />
        )}
        {activeTab === "reviews" && <ReviewsPanel setActiveTab={setActiveTab} />}
      </section>
    </div>
  );
}

function ProfilePanel({
  merchant,
  profile,
  role,
}: {
  merchant?: Merchant;
  profile: ProfileContentProps["profile"];
  role: UserRole;
}) {
  const [firstName, lastName] = splitName(profile.name);
  const [merchantAddress, setMerchantAddress] = useState(
    merchant?.location ?? "Bandung",
  );
  const [merchantLatitude, setMerchantLatitude] = useState(
    merchant?.latitude?.toString() ?? bandungPinpoint.latitude,
  );
  const [merchantLongitude, setMerchantLongitude] = useState(
    merchant?.longitude?.toString() ?? bandungPinpoint.longitude,
  );
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [locationSearch, setLocationSearch] = useState(
    merchant?.location ?? "Bandung",
  );
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  function resetMerchantLocation() {
    setMerchantAddress(merchant?.location ?? "Bandung");
    setMerchantLatitude(merchant?.latitude?.toString() ?? bandungPinpoint.latitude);
    setMerchantLongitude(merchant?.longitude?.toString() ?? bandungPinpoint.longitude);
    setLocationSearch(merchant?.location ?? "Bandung");
    setLocationStatus("idle");
  }

  async function searchMerchantLocation() {
    const query = locationSearch.trim() || merchantAddress.trim();

    if (!query) {
      setLocationStatus("error");
      return;
    }

    setIsSearchingLocation(true);
    setLocationStatus("idle");

    try {
      const params = new URLSearchParams({
        format: "json",
        limit: "1",
        q: `${query}, Indonesia`,
      });
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      );
      const results = (await response.json()) as Array<{
        display_name?: string;
        lat?: string;
        lon?: string;
      }>;
      const firstResult = results[0];

      if (!firstResult?.lat || !firstResult.lon) {
        setLocationStatus("error");
        return;
      }

      setMerchantAddress(firstResult.display_name ?? query);
      setMerchantLatitude(Number(firstResult.lat).toFixed(6));
      setMerchantLongitude(Number(firstResult.lon).toFixed(6));
    } catch {
      setLocationStatus("error");
    } finally {
      setIsSearchingLocation(false);
    }
  }

  async function saveMerchantLocation() {
    setLocationStatus("saving");

    try {
      const response = await secureFetch("/api/merchant/location", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: merchantAddress,
          latitude: Number(merchantLatitude),
          longitude: Number(merchantLongitude),
        }),
      });

      if (!response.ok) {
        setLocationStatus("error");
        return;
      }

      setLocationStatus("saved");
    } catch {
      setLocationStatus("error");
    }
  }

  return (
    <div className="rounded-xl bg-rf-surface-base p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] md:p-8">
      <div className="mb-6 border-b border-rf-outline-variant/20 pb-4">
        <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
          Profile Information
        </p>
        <h2 className="mt-1 font-heading text-[32px] font-bold leading-10 tracking-[-0.01em] text-rf-text-onyx">
          Personal Details
        </h2>
      </div>

      <form className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ReadOnlyField label="First Name" value={firstName} />
          <ReadOnlyField label="Last Name" value={lastName} />
          <ReadOnlyField className="md:col-span-2" label="Email Address" value={profile.email} />
          <ReadOnlyField
            className="md:col-span-2"
            label="Active Role"
            value={roleLabels[role]}
          />
          {role === "merchant" && (
            <>
              <ReadOnlyField
                label="Business Name"
                value={merchant?.name ?? "Merchant profile"}
              />
            </>
          )}
        </div>

        {role === "merchant" && (
          <div className="rounded-xl border border-rf-outline-variant/30 bg-rf-surface-container-low p-5">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
                  Merchant pickup location
                </p>
                <h3 className="mt-1 font-heading text-xl font-semibold leading-7 text-rf-text-onyx">
                  Saved address and map pinpoint
                </h3>
                <p className="mt-1 text-sm font-semibold leading-6 text-rf-text-muted">
                  Lokasi ini akan dipakai otomatis saat membuat listing baru.
                </p>
              </div>
              <button
                type="button"
                onClick={saveMerchantLocation}
                disabled={locationStatus === "saving"}
                className="rf-focus-ring inline-flex w-fit items-center justify-center rounded-full bg-rf-primary-container px-5 py-2 text-sm font-extrabold text-white transition hover:bg-rf-primary disabled:cursor-not-allowed disabled:bg-rf-outline-variant"
              >
                {locationStatus === "saving" ? "Saving..." : "Save location"}
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
              <div className="grid gap-4">
                <div className="rounded-xl border border-rf-outline-variant/30 bg-rf-surface-base p-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-extrabold text-rf-text-onyx">
                      Search location
                    </span>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        value={locationSearch}
                        onChange={(event) => setLocationSearch(event.target.value)}
                        placeholder="Cari alamat, mis. Dago Bakery Bandung"
                        className="rf-focus-ring h-12 min-w-0 flex-1 rounded-rf-control border border-rf-outline-variant bg-rf-surface-container-low px-4 text-sm font-semibold outline-none focus:border-rf-primary"
                      />
                      <button
                        type="button"
                        onClick={searchMerchantLocation}
                        disabled={isSearchingLocation}
                        className="rf-focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-rf-control bg-rf-primary px-4 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:bg-rf-outline-variant"
                      >
                        <span className="material-symbols-outlined text-[18px]">search</span>
                        {isSearchingLocation ? "Searching..." : "Search"}
                      </button>
                    </div>
                  </label>
                  <p className="mt-2 text-xs font-semibold leading-5 text-rf-text-muted">
                    Search memakai OpenStreetMap Nominatim. Setelah hasil ketemu,
                    pin otomatis pindah ke lokasi tersebut.
                  </p>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-extrabold text-rf-text-onyx">
                    Address text
                  </span>
                  <textarea
                    rows={4}
                    value={merchantAddress}
                    onChange={(event) => setMerchantAddress(event.target.value)}
                    placeholder="Contoh: Green Oven Bakery, Jl. Ir. H. Juanda No. 120, Dago, Bandung"
                    className="rf-focus-ring min-h-28 rounded-rf-control border border-rf-outline-variant bg-rf-surface-base px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-rf-primary"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <EditableField
                    label="Latitude"
                    value={merchantLatitude}
                    onChange={setMerchantLatitude}
                  />
                  <EditableField
                    label="Longitude"
                    value={merchantLongitude}
                    onChange={setMerchantLongitude}
                  />
                </div>

                <p className="text-xs font-semibold leading-5 text-rf-text-muted">
                  Search alamat, klik peta, atau geser pin untuk mengatur
                  pinpoint. Default pin diarahkan ke Bandung.
                </p>
                {locationStatus === "saved" && (
                  <p className="rounded-rf-control bg-rf-primary-fixed px-4 py-3 text-sm font-extrabold text-rf-primary">
                    Lokasi merchant tersimpan.
                  </p>
                )}
                {locationStatus === "error" && (
                  <p className="rounded-rf-control bg-rf-error-container px-4 py-3 text-sm font-extrabold text-rf-error">
                    Lokasi belum bisa disimpan. Pastikan alamat dan koordinat valid.
                  </p>
                )}
              </div>

              <MerchantLocationPicker
                address={merchantAddress}
                latitude={merchantLatitude}
                longitude={merchantLongitude}
                onPick={(latitude, longitude) => {
                  setMerchantLatitude(latitude.toFixed(6));
                  setMerchantLongitude(longitude.toFixed(6));
                }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col justify-end gap-3 border-t border-rf-outline-variant/20 pt-6 sm:flex-row">
          <button
            type="button"
            onClick={resetMerchantLocation}
            className="rf-focus-ring inline-flex items-center justify-center rounded-full border border-rf-primary px-6 py-2 text-sm font-extrabold text-rf-primary transition hover:bg-rf-surface-container-low"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={role === "merchant" ? saveMerchantLocation : undefined}
            disabled={role === "merchant" && locationStatus === "saving"}
            className="rf-focus-ring inline-flex items-center justify-center rounded-full bg-rf-primary-container px-6 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-rf-primary"
          >
            {locationStatus === "saving" ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function HistoryPanel({
  listings,
  orders,
  role,
}: {
  listings: FoodListing[];
  orders: RescueOrder[];
  role: UserRole;
}) {
  const visibleOrders = useMemo(() => orders, [orders]);

  if (visibleOrders.length === 0) {
    return (
      <EmptyState
        actionHref={role === "merchant" ? "/merchant" : "/"}
        actionLabel={role === "merchant" ? "Buka Dashboard" : "Go to Marketplace"}
        icon="receipt_long"
        title={role === "merchant" ? "Belum ada pickup" : "No Orders Yet"}
        text={
          role === "merchant"
            ? "Order paid dari customer akan muncul di sini setelah listing mendapat transaksi."
            : "Start rescuing surplus meals and your order history will appear here."
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {visibleOrders.map((order) => {
        const listing = listings.find((item) => item.id === order.listingId);

        return (
          <OrderCard
            key={order.id}
            listing={listing}
            order={order}
            role={role}
          />
        );
      })}
    </div>
  );
}

function ReviewsPanel({
  setActiveTab,
}: {
  setActiveTab: (tab: ProfileTab) => void;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await secureFetch("/api/reviews");
      const result = await response.json();

      if (response.ok && result.data) {
        setReviews(result.data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(fetchReviews, 0);
    return () => window.clearTimeout(timeout);
  }, [fetchReviews]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-xl bg-rf-surface-base p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
        <p className="text-rf-text-muted">Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl bg-rf-surface-base p-6 py-16 text-center shadow-[0px_10px_30px_rgba(0,0,0,0.04)] md:p-8">
        <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-rf-tertiary-container/15 text-rf-tertiary">
          <span
            className="material-symbols-outlined text-[64px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            reviews
          </span>
        </div>
        <h3 className="font-heading text-[32px] font-bold leading-10 tracking-[-0.01em] text-rf-text-onyx">
          No Reviews Yet
        </h3>
        <p className="mb-8 mt-2 max-w-md text-base leading-6 tracking-[0.01em] text-rf-text-muted">
          You have not left any reviews for your past rescues. Help the community
          by sharing your experience after pickup is completed.
        </p>
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className="rf-focus-ring rounded-full bg-rf-primary-container px-6 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-rf-primary"
        >
          Go to Past Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-xl bg-rf-surface-base p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]"
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="font-heading text-xl font-semibold leading-7 text-rf-text-onyx">
                {review.order.listing.title}
              </h3>
              <p className="mt-1 text-sm text-rf-text-muted">
                {review.order.listing.merchantName}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="material-symbols-outlined text-[20px]"
                  style={{
                    fontVariationSettings: star <= review.rating ? "'FILL' 1" : "'FILL' 0",
                    color: star <= review.rating ? "#F59E0B" : "#D1D5DB",
                  }}
                >
                  star
                </span>
              ))}
            </div>
          </div>

          {review.comment && (
            <p className="mb-3 text-base leading-6 text-rf-text-onyx">
              {review.comment}
            </p>
          )}

          <p className="text-xs text-rf-text-muted">
            {new Date(review.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      ))}
    </div>
  );
}

function OrderCard({
  listing,
  order,
  role,
}: {
  listing?: FoodListing;
  order: RescueOrder;
  role: UserRole;
}) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasReview, setHasReview] = useState(false);
  const [checkingReview, setCheckingReview] = useState(true);

  const isCancelled = order.status === "cancelled";
  const isCompleted = order.status === "completed";
  const total = (listing?.rescuePrice ?? 0) * order.quantity;
  const detailHref =
    role === "merchant"
      ? `/merchant/orders/${order.id}`
      : order.paymentStatus === "PAID"
        ? `/orders/${order.id}`
        : `/payment/${order.id}`;

  const checkReview = useCallback(async () => {
    if (!isCompleted || role === "merchant") {
      setCheckingReview(false);
      return;
    }

    try {
      const response = await secureFetch(`/api/orders/${order.id}/review`);
      const result = await response.json();

      if (response.ok && result.data) {
        setHasReview(true);
      }
    } catch (error) {
      console.error("Error checking review:", error);
    } finally {
      setCheckingReview(false);
    }
  }, [isCompleted, order.id, role]);

  useEffect(() => {
    const timeout = window.setTimeout(checkReview, 0);
    return () => window.clearTimeout(timeout);
  }, [checkReview]);

  return (
    <>
      <article
        className={`rounded-xl bg-rf-surface-base p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0px_20px_40px_rgba(21,128,61,0.08)] ${
          isCancelled ? "opacity-80" : ""
        }`}
      >
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-rf-outline-variant/20 pb-4 md:flex-row md:items-center">
          <div>
            <p className="mb-1 text-xs font-extrabold uppercase tracking-wider text-rf-text-muted">
              Order #{order.id.slice(-8).toUpperCase()}
            </p>
            <p className="text-base leading-6 tracking-[0.01em] text-rf-text-onyx">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill status={order.paymentStatus === "PAID" ? order.status : "pending"} />
            <p className={`font-heading text-xl font-semibold leading-7 text-rf-text-onyx ${isCancelled ? "line-through opacity-70" : ""}`}>
              Rp {total.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className={`flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-rf-surface-container text-rf-primary ${isCancelled ? "grayscale" : ""}`}>
            <span className="material-symbols-outlined text-[36px]">
              {listing?.category === "bakery" ? "bakery_dining" : "restaurant"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading text-xl font-semibold leading-7 text-rf-text-onyx">
              {listing?.title ?? "Rescue order"}
            </h3>
            <p className="mb-4 mt-1 text-base leading-6 tracking-[0.01em] text-rf-text-muted">
              {listing?.merchantName ?? order.customerName} - {order.quantity} item
            </p>
            {isCompleted && role === "customer" && !checkingReview && (
              hasReview ? (
                <div className="inline-flex items-center gap-1 text-sm font-extrabold text-rf-primary">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Review Submitted
                </div>
              ) : (
                <button 
                  className="inline-flex items-center gap-1 text-sm font-extrabold text-rf-primary hover:underline" 
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                >
                  <span className="material-symbols-outlined text-sm">rate_review</span>
                  Leave a Review
                </button>
              )
            )}
            {!isCompleted && !isCancelled && (
              <p className="text-xs font-extrabold text-rf-secondary">
                {order.paymentStatus === "PAID"
                  ? `Pickup code ${order.pickupCode}`
                  : "Payment required before pickup"}
              </p>
            )}
            {isCancelled && (
              <p className="text-xs font-extrabold text-rf-error">
                Cancelled before pickup completion
              </p>
            )}
          </div>
          <Link
            href={detailHref}
            className="rf-focus-ring hidden h-fit rounded-full border border-rf-outline-variant px-4 py-2 text-sm font-extrabold text-rf-primary transition hover:bg-rf-surface-container-low sm:inline-flex"
          >
            View Details
          </Link>
        </div>
      </article>

      {showReviewModal && listing && (
        <ReviewModal
          orderId={order.id}
          merchantName={listing.merchantName ?? "Merchant"}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setHasReview(true);
            setShowReviewModal(false);
          }}
        />
      )}
    </>
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rf-focus-ring flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-heading text-xl font-semibold leading-7 transition ${
        active
          ? "bg-rf-primary-container text-white"
          : "text-rf-text-muted hover:bg-rf-surface-container-low hover:text-rf-primary"
      }`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function ImpactLine({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-4 last:mb-0">
      <div className="flex size-12 items-center justify-center rounded-full bg-rf-secondary-container/20 text-rf-secondary">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="font-heading text-2xl font-bold leading-8 tracking-[-0.01em] text-rf-primary">
          {value}
        </p>
        <p className="text-xs font-extrabold uppercase tracking-wider text-rf-text-muted">
          {label}
        </p>
      </div>
    </div>
  );
}

function ReadOnlyField({
  className = "",
  label,
  value,
}: {
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-extrabold text-rf-text-muted">
        {label}
      </span>
      <input
        readOnly
        value={value}
        className="rf-focus-ring w-full rounded-xl border border-rf-outline-variant bg-rf-surface px-4 py-3 text-base font-semibold text-rf-text-onyx outline-none transition focus:border-rf-primary focus:ring-2 focus:ring-rf-primary/20"
      />
    </label>
  );
}

function EditableField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-rf-text-onyx">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rf-focus-ring h-12 rounded-rf-control border border-rf-outline-variant bg-rf-surface-base px-4 text-sm font-semibold outline-none focus:border-rf-primary"
      />
    </label>
  );
}

function StatusPill({ status }: { status: RescueOrder["status"] }) {
  const statusCopy = status.replaceAll("_", " ");
  const isError = status === "cancelled";
  const className = isError
    ? "border-rf-error-container bg-rf-error-container/30 text-rf-error"
    : "border-rf-secondary-container bg-rf-secondary-container/20 text-rf-primary";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-extrabold capitalize ${className}`}>
      <span className={`size-2 rounded-full ${isError ? "bg-rf-error" : "bg-rf-primary"}`} />
      {statusCopy}
    </span>
  );
}

function EmptyState({
  actionHref,
  actionLabel,
  icon,
  text,
  title,
}: {
  actionHref: string;
  actionLabel: string;
  icon: string;
  text: string;
  title: string;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl bg-rf-surface-base p-6 py-16 text-center shadow-[0px_10px_30px_rgba(0,0,0,0.04)] md:p-8">
      <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-rf-primary/10 text-rf-primary">
        <span className="material-symbols-outlined text-[56px]">{icon}</span>
      </div>
      <h3 className="font-heading text-[32px] font-bold leading-10 tracking-[-0.01em] text-rf-text-onyx">
        {title}
      </h3>
      <p className="mb-8 mt-2 max-w-md text-base leading-6 tracking-[0.01em] text-rf-text-muted">
        {text}
      </p>
      <Link
        href={actionHref}
        className="rf-focus-ring rounded-full bg-rf-primary-container px-6 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-rf-primary"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return ["Guest", "Customer"];
  }

  if (parts.length === 1) {
    return [parts[0], ""];
  }

  return [parts[0], parts.slice(1).join(" ")];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
