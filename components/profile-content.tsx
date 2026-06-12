"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notifySessionChanged } from "@/components/role-switcher";
import type { FoodListing, Merchant, RescueOrder, UserRole } from "@/lib/types";
import { MerchantLocationPicker } from "@/components/merchant-location-picker";
import { ReviewModal } from "./review-modal";
import { secureFetch } from "@/lib/secure-fetch";

const DIETARY_OPTIONS = [
  "Halal",
  "Vegan",
  "Vegetarian",
  "Peanut-Free",
  "Gluten-Free",
  "Dairy-Free",
  "No Seafood",
  "No Egg",
];

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
  hasPassword?: boolean;
  role: UserRole;
};


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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

/* ─── Delete Account Section ─────────────────────────────────────────────── */


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
        actionHref={role === "merchant" ? "/merchant" : "/marketplace"}
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


export function ProfileContent({
  initialListings = [],
  initialMerchant,
  initialOrders = [],
  profile,
  hasPassword = true,
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
            hasPassword={hasPassword}
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

/* ─── Password strength helper ───────────────────────────────────────────── */
function getPwdStrength(pwd: string): { score: number } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) score++;
  return { score };
}

function DietaryPreferencesPanel() {
  const [prefs, setPrefs] = useState<string[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    secureFetch("/api/subscriptions")
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          setPrefs(result.data.dietaryPreferences ?? []);
          setSubscriptionStatus(result.data.subscriptionStatus ?? null);
        }
      })
      .catch(() => {});
  }, []);

  async function save() {
    setStatus("saving");
    try {
      const res = await secureFetch("/api/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dietaryPreferences: prefs }),
      });
      setStatus(res.ok ? "saved" : "error");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    }
  }

  async function toggleSubscription() {
    const next = subscriptionStatus === "active" ? "inactive" : "active";
    try {
      const res = await secureFetch("/api/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionStatus: next }),
      });
      const result = await res.json();
      if (res.ok) setSubscriptionStatus(result.data.subscriptionStatus);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="rounded-xl bg-rf-surface-base p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] md:p-8">
      <div className="mb-5 flex items-start justify-between border-b border-rf-outline-variant/20 pb-4">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
            Meal Plan
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-rf-text-onyx">
            Dietary Preferences &amp; Subscription
          </h2>
        </div>
        <button
          type="button"
          onClick={toggleSubscription}
          className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
            subscriptionStatus === "active"
              ? "bg-rf-error-container text-rf-error hover:opacity-80"
              : "bg-rf-primary-container text-white hover:bg-rf-primary"
          }`}
        >
          {subscriptionStatus === "active" ? "Cancel Subscription" : "Subscribe"}
        </button>
      </div>

      <p className="mb-4 text-sm font-semibold text-rf-text-muted">
        Select dietary requirements. Auto-assigned surplus packages will never
        contain these allergens.
      </p>

      <div className="flex flex-wrap gap-3">
        {DIETARY_OPTIONS.map((opt) => (
          <label
            key={opt}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-rf-outline-variant px-3 py-1.5 text-sm font-semibold has-[:checked]:border-rf-primary has-[:checked]:bg-rf-primary/10"
          >
            <input
              type="checkbox"
              className="accent-rf-primary"
              checked={prefs.includes(opt)}
              onChange={(e) =>
                setPrefs((prev) =>
                  e.target.checked ? [...prev, opt] : prev.filter((p) => p !== opt),
                )
              }
            />
            {opt}
          </label>
        ))}
      </div>

      {status === "saved" && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          Preferences saved.
        </p>
      )}
      {status === "error" && (
        <p className="mt-4 rounded-xl bg-rf-error-container px-4 py-3 text-sm font-semibold text-rf-error">
          Failed to save. Try again.
        </p>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={status === "saving"}
          className="rf-focus-ring rounded-full bg-rf-primary-container px-5 py-2 text-sm font-extrabold text-white transition hover:bg-rf-primary disabled:opacity-60"
        >
          {status === "saving" ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}

function ProfilePanel({
  merchant,
  profile,
  hasPassword,
  role,
}: {
  merchant?: Merchant;
  profile: ProfileContentProps["profile"];
  hasPassword: boolean;
  role: UserRole;
}) {
  // ── Profile fields ──────────────────────────────────────────────────────
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [businessName, setBusinessName] = useState(merchant?.name ?? "");
  const [profileStatus, setProfileStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [profileError, setProfileError] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // ── Password fields ─────────────────────────────────────────────────────
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdStatus, setPwdStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [pwdError, setPwdError] = useState("");
  const [isEditingPwd, setIsEditingPwd] = useState(false);

  // ── Merchant location ───────────────────────────────────────────────────
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

  // Password strength
  const pwdStrength = newPwd ? getPwdStrength(newPwd) : null;
  const pwdRequirements = [
    { test: newPwd.length >= 8, label: "Min. 8 karakter" },
    { test: /[A-Z]/.test(newPwd), label: "1 huruf besar" },
    { test: /[a-z]/.test(newPwd), label: "1 huruf kecil" },
    { test: /[0-9]/.test(newPwd), label: "1 angka" },
    { test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPwd), label: "1 karakter spesial" },
  ];

  async function saveProfile() {
    setProfileError("");
    setProfileStatus("saving");

    // Client-side validation
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    const trimmedBusinessName = businessName.trim();

    if (trimmedName.length < 2) {
      setProfileError("Nama minimal 2 karakter.");
      setProfileStatus("error");
      return;
    }
    if (role === "merchant" && trimmedBusinessName.length < 2) {
      setProfileError("Nama toko minimal 2 karakter.");
      setProfileStatus("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setProfileError("Format email tidak valid.");
      setProfileStatus("error");
      return;
    }

    try {
      const res = await secureFetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          ...(role === "merchant"
            ? { businessName: trimmedBusinessName }
            : {}),
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        setProfileError(result.error ?? "Gagal menyimpan profil.");
        setProfileStatus("error");
        return;
      }

      setName(result.data.name);
      setEmail(result.data.email);
      if (result.data.merchant?.businessName) {
        setBusinessName(result.data.merchant.businessName);
      }
      setProfileStatus("saved");
      setIsEditingProfile(false);
      setTimeout(() => setProfileStatus("idle"), 3000);
    } catch {
      setProfileError("Tidak bisa terhubung ke server.");
      setProfileStatus("error");
    }
  }

  function cancelProfileEdit() {
    setName(profile.name);
    setEmail(profile.email);
    setBusinessName(merchant?.name ?? "");
    setProfileError("");
    setProfileStatus("idle");
    setIsEditingProfile(false);
  }

  async function savePassword() {
    setPwdError("");
    setPwdStatus("saving");

    if (newPwd !== confirmPwd) {
      setPwdError("Konfirmasi password tidak cocok.");
      setPwdStatus("error");
      return;
    }

    try {
      const res = await secureFetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPwd,
          newPassword: newPwd,
          confirmPassword: confirmPwd,
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        setPwdError(result.error ?? "Gagal mengubah password.");
        setPwdStatus("error");
        return;
      }

      setPwdStatus("saved");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setIsEditingPwd(false);
      setTimeout(() => setPwdStatus("idle"), 3000);
    } catch {
      setPwdError("Tidak bisa terhubung ke server.");
      setPwdStatus("error");
    }
  }

  function cancelPwdEdit() {
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setPwdError("");
    setPwdStatus("idle");
    setIsEditingPwd(false);
  }

  async function searchMerchantLocation() {
    const query = locationSearch.trim() || merchantAddress.trim();
    if (!query) { setLocationStatus("error"); return; }
    setIsSearchingLocation(true);
    setLocationStatus("idle");
    try {
      const params = new URLSearchParams({ format: "json", limit: "1", q: `${query}, Indonesia` });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      const results = (await response.json()) as Array<{ display_name?: string; lat?: string; lon?: string }>;
      const first = results[0];
      if (!first?.lat || !first.lon) { setLocationStatus("error"); return; }
      setMerchantAddress(first.display_name ?? query);
      setMerchantLatitude(Number(first.lat).toFixed(6));
      setMerchantLongitude(Number(first.lon).toFixed(6));
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: merchantAddress,
          latitude: Number(merchantLatitude),
          longitude: Number(merchantLongitude),
        }),
      });
      setLocationStatus(response.ok ? "saved" : "error");
    } catch {
      setLocationStatus("error");
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Personal Information ─────────────────────────────────────── */}
      <div className="rounded-xl bg-rf-surface-base p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] md:p-8">
        <div className="mb-6 flex items-start justify-between border-b border-rf-outline-variant/20 pb-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
              Profile Information
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-rf-text-onyx">
              Personal Details
            </h2>
          </div>
          {!isEditingProfile && (
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="flex items-center gap-2 rounded-full border border-rf-outline-variant px-4 py-2 text-sm font-bold text-rf-primary transition hover:border-rf-primary hover:bg-rf-primary/5"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-extrabold text-rf-text-muted">
                Nama Lengkap
              </span>
              {isEditingProfile ? (
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rf-text-muted">
                    badge
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="rf-focus-ring w-full rounded-xl border border-rf-primary bg-rf-surface py-3 pl-10 pr-4 text-base font-semibold text-rf-text-onyx outline-none focus:ring-2 focus:ring-rf-primary/20"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-rf-outline-variant bg-rf-surface px-4 py-3">
                  <span className="material-symbols-outlined text-rf-text-muted">badge</span>
                  <span className="text-base font-semibold text-rf-text-onyx">{name}</span>
                </div>
              )}
            </label>
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-extrabold text-rf-text-muted">
                Email Address
              </span>
              {isEditingProfile ? (
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rf-text-muted">
                    mail
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="rf-focus-ring w-full rounded-xl border border-rf-primary bg-rf-surface py-3 pl-10 pr-4 text-base font-semibold text-rf-text-onyx outline-none focus:ring-2 focus:ring-rf-primary/20"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-rf-outline-variant bg-rf-surface px-4 py-3">
                  <span className="material-symbols-outlined text-rf-text-muted">mail</span>
                  <span className="text-base font-semibold text-rf-text-onyx">{email}</span>
                </div>
              )}
            </label>
          </div>

          {role === "merchant" && (
            <div className="md:col-span-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-extrabold text-rf-text-muted">
                  Nama Toko
                </span>
                {isEditingProfile ? (
                  <div className="relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rf-text-muted">
                      storefront
                    </span>
                    <input
                      type="text"
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      className="rf-focus-ring w-full rounded-xl border border-rf-primary bg-rf-surface py-3 pl-10 pr-4 text-base font-semibold text-rf-text-onyx outline-none focus:ring-2 focus:ring-rf-primary/20"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-rf-outline-variant bg-rf-surface px-4 py-3">
                    <span className="material-symbols-outlined text-rf-text-muted">storefront</span>
                    <span className="text-base font-semibold text-rf-text-onyx">{businessName || "-"}</span>
                  </div>
                )}
              </label>
            </div>
          )}

          {/* Role — always readonly */}
          <div className="md:col-span-2">
            <span className="mb-1.5 block text-sm font-extrabold text-rf-text-muted">
              Active Role
            </span>
            <div className="flex items-center gap-3 rounded-xl border border-rf-outline-variant bg-rf-surface-container-low px-4 py-3">
              <span className="material-symbols-outlined text-rf-text-muted">
                {role === "admin" ? "admin_panel_settings" : role === "merchant" ? "storefront" : role === "charity" ? "volunteer_activism" : "person"}
              </span>
              <span className="text-base font-semibold capitalize text-rf-text-muted">{role}</span>
              <span className="ml-auto rounded-full bg-rf-surface-container px-2 py-0.5 text-xs font-bold text-rf-text-muted">
                Tidak dapat diubah
              </span>
            </div>
          </div>
        </div>

        {/* Profile error */}
        {profileError && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-rf-error-container px-4 py-3 text-sm font-semibold text-rf-error">
            <span className="material-symbols-outlined text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            {profileError}
          </p>
        )}
        {profileStatus === "saved" && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <span className="material-symbols-outlined text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Profil berhasil diperbarui.
          </p>
        )}

        {/* Profile action buttons */}
        {isEditingProfile && (
          <div className="mt-6 flex justify-end gap-3 border-t border-rf-outline-variant/20 pt-5">
            <button
              type="button"
              onClick={cancelProfileEdit}
              className="rf-focus-ring rounded-full border border-rf-outline-variant px-6 py-2 text-sm font-extrabold text-rf-text-muted transition hover:border-rf-text-onyx hover:text-rf-text-onyx"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={saveProfile}
              disabled={profileStatus === "saving"}
              className="rf-focus-ring inline-flex items-center gap-2 rounded-full bg-rf-primary-container px-6 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-rf-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {profileStatus === "saving" ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">save</span>
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Change Password ──────────────────────────────────────────── */}
      <div className="rounded-xl bg-rf-surface-base p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] md:p-8">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
              Security
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-rf-text-onyx">
              {hasPassword ? "Ganti Password" : "Set Password"}
            </h2>
            {!hasPassword && (
              <p className="mt-1 text-sm text-rf-text-muted">
                Akun kamu terdaftar via Google. Set password agar bisa login dengan email juga.
              </p>
            )}
          </div>
          {!isEditingPwd && (
            <button
              type="button"
              onClick={() => setIsEditingPwd(true)}
              className="flex items-center gap-2 rounded-full border border-rf-outline-variant px-4 py-2 text-sm font-bold text-rf-primary transition hover:border-rf-primary hover:bg-rf-primary/5"
            >
              <span className="material-symbols-outlined text-base">lock</span>
              {hasPassword ? "Ubah" : "Set Password"}
            </button>
          )}
        </div>

        {!isEditingPwd && (
          <div className="flex items-center gap-3 rounded-xl border border-rf-outline-variant bg-rf-surface-container-low px-4 py-3">
            <span className="material-symbols-outlined text-rf-text-muted" style={{ fontVariationSettings: "'FILL' 1" }}>
              {hasPassword ? "lock" : "lock_open"}
            </span>
            <span className="text-sm font-semibold text-rf-text-muted">
              {hasPassword ? "••••••••••••" : "Belum ada password"}
            </span>
          </div>
        )}

        {isEditingPwd && (
          <div className="space-y-4">
            {/* Current password — hanya untuk non-OAuth */}
            {hasPassword && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-extrabold text-rf-text-muted">
                  Password Saat Ini
                </span>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rf-text-muted">lock</span>
                  <input
                    type={showCurrentPwd ? "text" : "password"}
                    value={currentPwd}
                    onChange={e => setCurrentPwd(e.target.value)}
                    placeholder="Password saat ini"
                    autoComplete="current-password"
                    className="rf-focus-ring w-full rounded-xl border border-rf-outline-variant bg-rf-surface py-3 pl-10 pr-10 text-base outline-none focus:border-rf-primary focus:ring-2 focus:ring-rf-primary/20"
                  />
                  <button type="button" onClick={() => setShowCurrentPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-rf-text-muted hover:text-rf-primary">
                    <span className="material-symbols-outlined text-xl">{showCurrentPwd ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </label>
            )}

            {/* New password */}
            <div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-extrabold text-rf-text-muted">
                  Password Baru
                </span>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rf-text-muted">lock_reset</span>
                  <input
                    type={showNewPwd ? "text" : "password"}
                    value={newPwd}
                    onChange={e => setNewPwd(e.target.value)}
                    placeholder="Password baru"
                    autoComplete="new-password"
                    className="rf-focus-ring w-full rounded-xl border border-rf-outline-variant bg-rf-surface py-3 pl-10 pr-10 text-base outline-none focus:border-rf-primary focus:ring-2 focus:ring-rf-primary/20"
                  />
                  <button type="button" onClick={() => setShowNewPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-rf-text-muted hover:text-rf-primary">
                    <span className="material-symbols-outlined text-xl">{showNewPwd ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </label>

              {/* Strength bar + checklist */}
              {newPwd && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
                        pwdStrength && i <= pwdStrength.score
                          ? pwdStrength.score >= 4 ? "bg-rf-primary"
                            : pwdStrength.score === 3 ? "bg-emerald-400"
                            : pwdStrength.score === 2 ? "bg-amber-400"
                            : "bg-red-400"
                          : "bg-rf-outline-variant"
                      }`}/>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    {pwdRequirements.map(r => (
                      <span key={r.label} className={`flex items-center gap-1 text-xs ${r.test ? "text-emerald-600" : "text-rf-text-muted"}`}>
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {r.test ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        {r.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm new password */}
            <label className="block">
              <span className="mb-1.5 block text-sm font-extrabold text-rf-text-muted">
                Konfirmasi Password Baru
              </span>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rf-text-muted">lock_check</span>
                <input
                  type={showConfirmPwd ? "text" : "password"}
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  placeholder="Ulangi password baru"
                  autoComplete="new-password"
                  className={`rf-focus-ring w-full rounded-xl border py-3 pl-10 pr-10 text-base outline-none focus:ring-2 transition-colors ${
                    confirmPwd && confirmPwd !== newPwd
                      ? "border-red-400 bg-red-50/40 focus:ring-red-200"
                      : confirmPwd && confirmPwd === newPwd
                      ? "border-emerald-400 bg-emerald-50/30 focus:ring-emerald-200"
                      : "border-rf-outline-variant bg-rf-surface focus:border-rf-primary focus:ring-rf-primary/20"
                  }`}
                />
                <button type="button" onClick={() => setShowConfirmPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-rf-text-muted hover:text-rf-primary">
                  <span className="material-symbols-outlined text-xl">{showConfirmPwd ? "visibility_off" : "visibility"}</span>
                </button>
                {confirmPwd && (
                  <span className={`material-symbols-outlined absolute right-10 top-1/2 -translate-y-1/2 text-xl ${
                    confirmPwd === newPwd ? "text-emerald-500" : "text-red-500"
                  }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {confirmPwd === newPwd ? "check_circle" : "cancel"}
                  </span>
                )}
              </div>
              {confirmPwd && confirmPwd !== newPwd && (
                <p className="mt-1 text-xs text-red-600">Password tidak cocok</p>
              )}
            </label>

            {/* Password error / success */}
            {pwdError && (
              <p className="flex items-center gap-2 rounded-xl bg-rf-error-container px-4 py-3 text-sm font-semibold text-rf-error">
                <span className="material-symbols-outlined text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                {pwdError}
              </p>
            )}
            {pwdStatus === "saved" && (
              <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <span className="material-symbols-outlined text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Password berhasil diperbarui.
              </p>
            )}

            <div className="flex justify-end gap-3 border-t border-rf-outline-variant/20 pt-4">
              <button type="button" onClick={cancelPwdEdit}
                className="rf-focus-ring rounded-full border border-rf-outline-variant px-6 py-2 text-sm font-extrabold text-rf-text-muted transition hover:border-rf-text-onyx hover:text-rf-text-onyx">
                Batal
              </button>
              <button type="button" onClick={savePassword} disabled={pwdStatus === "saving"}
                className="rf-focus-ring inline-flex items-center gap-2 rounded-full bg-rf-primary-container px-6 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-rf-primary disabled:cursor-not-allowed disabled:opacity-60">
                {pwdStatus === "saving" ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">lock_reset</span>
                    {hasPassword ? "Ganti Password" : "Set Password"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Dietary Preferences & Subscription ─────────────────────── */}
      {role === "customer" && <DietaryPreferencesPanel />}

      {/* ── Merchant location ────────────────────────────────────────── */}
      {role === "merchant" && (
        <div className="rounded-xl bg-rf-surface-base p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] md:p-8">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
                Merchant
              </p>
              <h3 className="mt-1 font-heading text-2xl font-bold text-rf-text-onyx">
                Lokasi Pickup
              </h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-rf-text-muted">
                Lokasi ini akan dipakai otomatis saat membuat listing baru.
              </p>
            </div>
            <button type="button" onClick={saveMerchantLocation} disabled={locationStatus === "saving"}
              className="rf-focus-ring inline-flex w-fit items-center justify-center gap-2 rounded-full bg-rf-primary-container px-5 py-2 text-sm font-extrabold text-white transition hover:bg-rf-primary disabled:cursor-not-allowed disabled:opacity-60">
              {locationStatus === "saving" ? "Saving..." : "Save Location"}
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-4">
              <div className="rounded-xl border border-rf-outline-variant/30 bg-rf-surface-base p-4">
                <label className="grid gap-2">
                  <span className="text-sm font-extrabold text-rf-text-onyx">Search location</span>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input value={locationSearch} onChange={e => setLocationSearch(e.target.value)}
                      placeholder="Cari alamat, mis. Dago Bakery Bandung"
                      className="rf-focus-ring h-12 min-w-0 flex-1 rounded-rf-control border border-rf-outline-variant bg-rf-surface-container-low px-4 text-sm font-semibold outline-none focus:border-rf-primary" />
                    <button type="button" onClick={searchMerchantLocation} disabled={isSearchingLocation}
                      className="rf-focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-rf-control bg-rf-primary px-4 text-sm font-extrabold text-white disabled:opacity-60">
                      <span className="material-symbols-outlined text-[18px]">search</span>
                      {isSearchingLocation ? "Searching..." : "Search"}
                    </button>
                  </div>
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-extrabold text-rf-text-onyx">Address text</span>
                <textarea rows={4} value={merchantAddress} onChange={e => setMerchantAddress(e.target.value)}
                  placeholder="Contoh: Green Oven Bakery, Jl. Ir. H. Juanda No. 120, Dago, Bandung"
                  className="rf-focus-ring min-h-28 rounded-rf-control border border-rf-outline-variant bg-rf-surface-base px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-rf-primary" />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <EditableField label="Latitude" value={merchantLatitude} onChange={setMerchantLatitude} />
                <EditableField label="Longitude" value={merchantLongitude} onChange={setMerchantLongitude} />
              </div>

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
              onPick={(lat, lng) => {
                setMerchantLatitude(lat.toFixed(6));
                setMerchantLongitude(lng.toFixed(6));
              }}
            />
          </div>
        </div>
      )}

      {/* ── Danger Zone ─────────────────────────────────────────────── */}
      {role !== "admin" && (
        <DeleteAccountSection email={email} role={role} />
      )}
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

function DeleteAccountSection({
  email,
  role,
}: {
  email: string;
  role: UserRole;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isMatch = confirmEmail.trim().toLowerCase() === email.toLowerCase();

  async function handleDelete() {
    if (!isMatch) return;
    setError("");
    setLoading(true);

    try {
      const res = await secureFetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail: confirmEmail.trim() }),
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error ?? "Gagal menghapus akun. Coba lagi.");
        return;
      }

      // Session sudah di-clear server-side, beritahu client
      notifySessionChanged();
      router.push("/marketplace?deleted=1");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  const roleWarning =
    role === "merchant"
      ? "Semua listing aktif akan dinonaktifkan dan order pending akan dibatalkan."
      : role === "charity"
      ? "Semua klaim donasi aktif akan dibatalkan."
      : "Order yang sedang berjalan akan dibatalkan.";

  return (
    <div className="mt-10 rounded-xl border border-red-200 bg-red-50/50 p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
          <span
            className="material-symbols-outlined text-xl text-red-600"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            warning
          </span>
        </div>
        <div>
          <h3 className="font-heading text-base font-bold text-red-700">
            Danger Zone
          </h3>
          <p className="mt-0.5 text-sm text-red-600">
            Tindakan di bawah ini bersifat permanen dan tidak dapat diurungkan.
          </p>
        </div>
      </div>

      {!isOpen ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-4">
          <div>
            <p className="text-sm font-bold text-rf-text-onyx">Hapus Akun</p>
            <p className="mt-0.5 text-xs text-rf-text-muted">
              Akun dan semua aktivitas akan disembunyikan dari platform.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 active:scale-95"
          >
            <span
              className="material-symbols-outlined text-base"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              delete_forever
            </span>
            Hapus Akun Saya
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-red-300 bg-white p-5 space-y-4">
          <div>
            <p className="text-sm font-bold text-rf-text-onyx mb-1">
              Konfirmasi penghapusan akun
            </p>
            <p className="text-sm text-rf-text-muted">{roleWarning}</p>
            <p className="mt-2 text-sm text-rf-text-muted">
              Data histori (order, review, dll.) tetap tersimpan di sistem untuk
              keperluan akuntabilitas, namun profil kamu tidak akan terlihat.
            </p>
          </div>

          <div className="rounded-lg bg-red-50 px-4 py-3">
            <p className="text-xs font-bold text-red-700 mb-1">
              Ketik email kamu untuk konfirmasi:
            </p>
            <p className="font-mono text-sm font-bold text-red-800">{email}</p>
          </div>

          <input
            type="email"
            value={confirmEmail}
            onChange={e => {
              setConfirmEmail(e.target.value);
              setError("");
            }}
            placeholder={`Ketik ${email}`}
            className={`w-full rounded-xl border px-4 py-2.5 font-mono text-sm outline-none transition focus:ring-2
              ${confirmEmail && !isMatch
                ? "border-red-400 bg-red-50 focus:ring-red-200"
                : confirmEmail && isMatch
                ? "border-emerald-400 bg-emerald-50 focus:ring-emerald-200"
                : "border-rf-outline-variant focus:ring-red-200"
              }`}
            onKeyDown={e => e.key === "Enter" && isMatch && !loading && handleDelete()}
          />

          {error && (
            <p className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setConfirmEmail("");
                setError("");
              }}
              disabled={loading}
              className="flex-1 rounded-full border-2 border-rf-outline-variant py-2.5 text-sm font-semibold text-rf-text-muted transition hover:border-rf-text-onyx hover:text-rf-text-onyx disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!isMatch || loading}
              className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Menghapus...
                </span>
              ) : (
                "Hapus Akun Saya"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
