"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { FavoriteButton } from "@/components/favorite-button";
import { secureFetch } from "@/lib/secure-fetch";
import type { FoodCategory, FoodListing } from "@/lib/types";

type AssignedMeal = {
  title: string;
  merchantName: string;
  pickupLocation: string;
};

type MarketplaceBrowserProps = {
  listings: FoodListing[];
  isSubscriber?: boolean;
};

const categoryLabels: Record<FoodCategory | "all", string> = {
  all: "Semua",
  bakery: "Bakery",
  rice_meal: "Rice meal",
  vegetarian: "Vegetarian",
  beverage: "Minuman",
  snack: "Snack",
  produce: "Produce",
};

type AssignState = "idle" | "locating" | "assigning" | "done" | "error" | "already";

export function MarketplaceBrowser({ listings, isSubscriber }: MarketplaceBrowserProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FoodCategory | "all">("all");
  const [mode, setMode] = useState<"all" | "sale">("all");
  const [assignedMeal, setAssignedMeal] = useState<AssignedMeal | null>(null);
  const [assignState, setAssignState] = useState<AssignState>("idle");
  const [assignError, setAssignError] = useState("");

  async function claimDailyMeal() {
    if (!navigator.geolocation) {
      setAssignState("error");
      setAssignError("Browser tidak mendukung geolocation.");
      return;
    }

    setAssignState("locating");
    setAssignError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setAssignState("assigning");
        const { latitude, longitude } = pos.coords;
        try {
          const res = await secureFetch("/api/subscriptions/assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude }),
          });
          const result = await res.json();
          if (!res.ok) {
            setAssignState("error");
            setAssignError(result.error ?? "Gagal mengamankan porsi.");
            return;
          }
          if (!result.data?.isNew) {
            setAssignState("already");
            setAssignedMeal(result.data?.assignment?.listing ?? null);
          } else {
            setAssignState("done");
            setAssignedMeal(result.data.listing);
          }
        } catch {
          setAssignState("error");
          setAssignError("Tidak bisa terhubung ke server.");
        }
      },
      (err) => {
        setAssignState("error");
        setAssignError(
          err.code === 1
            ? "Izin lokasi ditolak. Aktifkan di pengaturan browser."
            : "Lokasi tidak tersedia. Coba lagi.",
        );
      },
      { timeout: 8000 },
    );
  }

  const visibleListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return listings.filter((listing) => {
      if (listing.type !== "sale") return false;

      const matchesQuery =
        normalizedQuery.length === 0 ||
        listing.title.toLowerCase().includes(normalizedQuery) ||
        listing.description.toLowerCase().includes(normalizedQuery) ||
        listing.merchantName?.toLowerCase().includes(normalizedQuery) ||
        listing.merchantLocation?.toLowerCase().includes(normalizedQuery);
      const matchesCategory = category === "all" || listing.category === category;
      const matchesMode = mode === "all" || listing.type === mode;

      return matchesQuery && matchesCategory && matchesMode;
    });
  }, [category, listings, mode, query]);

  return (
    <>
      {isSubscriber && (
        <div className="mx-auto max-w-7xl px-5 pt-6 md:px-8">
          {assignState === "idle" && (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-rf-primary/20 bg-rf-primary/5 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-rf-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  lunch_dining
                </span>
                <p className="text-sm font-extrabold text-rf-text-onyx">
                  Kamu berlangganan — amankan porsi gratis hari ini!
                </p>
              </div>
              <button
                type="button"
                onClick={claimDailyMeal}
                className="rf-focus-ring shrink-0 rounded-full bg-rf-primary-container px-4 py-2 text-sm font-extrabold text-white transition hover:bg-rf-primary"
              >
                Cari Porsi Terdekat
              </button>
            </div>
          )}

          {(assignState === "locating" || assignState === "assigning") && (
            <div className="flex items-center gap-3 rounded-xl border border-rf-outline-variant/30 bg-rf-surface-container-low px-5 py-4">
              <svg className="h-5 w-5 animate-spin text-rf-primary" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm font-semibold text-rf-text-muted">
                {assignState === "locating" ? "Mendapatkan lokasi kamu…" : "Mencari makanan terdekat…"}
              </p>
            </div>
          )}

          {assignState === "done" && assignedMeal && (
            <div className="flex items-start justify-between gap-4 rounded-xl border border-rf-primary/30 bg-rf-primary/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-rf-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <div>
                  <p className="text-sm font-extrabold text-rf-primary">Porsi hari ini berhasil diamankan!</p>
                  <p className="text-sm font-semibold text-rf-text-onyx">{assignedMeal.title} — {assignedMeal.merchantName}</p>
                  <p className="text-xs font-semibold text-rf-text-muted">{assignedMeal.pickupLocation}</p>
                </div>
              </div>
              <button type="button" onClick={() => setAssignState("idle")} className="shrink-0 text-rf-text-muted hover:text-rf-text-onyx">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          )}

          {assignState === "already" && (
            <div className="flex items-center gap-3 rounded-xl border border-rf-secondary/30 bg-rf-secondary/10 px-5 py-4">
              <span className="material-symbols-outlined text-xl text-rf-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                info
              </span>
              <p className="text-sm font-semibold text-rf-text-onyx">
                Porsi hari ini sudah diamankan sebelumnya. Cek di halaman Orders.
              </p>
            </div>
          )}

          {assignState === "error" && (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-rf-error/20 bg-rf-error-container/30 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl text-rf-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                  error
                </span>
                <p className="text-sm font-semibold text-rf-error">{assignError}</p>
              </div>
              <button type="button" onClick={() => setAssignState("idle")} className="shrink-0 text-sm font-extrabold text-rf-error hover:underline">
                Coba lagi
              </button>
            </div>
          )}
        </div>
      )}

      <section id="marketplace" className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
            Marketplace
          </p>
          <h2 className="mt-2 text-3xl font-black text-rf-text-onyx">
            Tersedia untuk pickup
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-rf-text-muted">
            Temukan surplus makanan terverifikasi berdasarkan kategori dan
            window pickup terdekat.
          </p>
        </div>
        <div className="grid gap-3 md:min-w-[520px]">
          <input
            aria-label="Cari makanan"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari makanan, merchant, lokasi"
            className="rf-focus-ring h-11 rounded-rf-control border border-rf-outline-variant bg-rf-surface-base px-4 text-sm font-semibold transition placeholder:text-rf-text-muted/70 focus:border-rf-primary"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              aria-label="Filter kategori"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as FoodCategory | "all")
              }
              className="rf-focus-ring h-11 rounded-rf-control border border-rf-outline-variant bg-rf-surface-base px-4 text-sm font-bold text-rf-text-onyx focus:border-rf-primary"
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 rounded-rf-control border border-rf-outline-variant bg-rf-surface-base p-1">
              {(["all", "sale"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={`rf-focus-ring h-9 rounded-[0.375rem] text-xs font-extrabold transition ${
                    mode === value
                      ? "bg-rf-primary text-white"
                      : "text-rf-text-muted hover:bg-rf-surface-container"
                  }`}
                >
                  {value === "all" ? "Semua" : "Diskon"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <SummaryChip label="Listing aktif" value={visibleListings.length} />
        <SummaryChip
          label="CO2 potential"
          value={`${visibleListings.reduce((total, listing) => total + listing.impactKgCo2, 0)}kg`}
        />
      </div>

      {visibleListings.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleListings.map((listing) => (
            <FoodCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="rounded-rf-card border border-dashed border-rf-outline-variant bg-rf-surface-base p-8 text-center">
          <h3 className="text-xl font-black text-rf-text-onyx">
            Belum ada listing yang cocok
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-rf-text-muted">
            Coba ubah kata kunci, kategori, atau mode listing untuk melihat
            opsi surplus makanan lain.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setMode("all");
            }}
            className="rf-focus-ring mt-5 rounded-rf-control bg-rf-primary px-5 py-3 text-sm font-extrabold text-white"
          >
            Reset filter
          </button>
        </div>
      )}
    </section>
    </>
  );
}

function FoodCard({ listing }: { listing: FoodListing }) {
  const merchantName = listing.merchantName ?? "Merchant";
  const merchantDistance = listing.merchantDistanceKm;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="rf-focus-ring overflow-hidden rounded-rf-card border border-rf-outline-variant/60 bg-rf-surface-base shadow-[0px_10px_30px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:border-rf-primary-container hover:shadow-[0px_20px_40px_rgba(21,128,61,0.08)]"
    >
      <div className="relative">
        <Image
          src={listing.imageUrl}
          alt={listing.title}
          width={640}
          height={420}
          className="h-56 w-full object-cover"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-rf-primary shadow-sm">
          Rescue Deal
        </span>
        <div className="absolute right-4 top-4">
          <FavoriteButton listingId={listing.id} />
        </div>
        <span className="absolute bottom-4 right-4 rounded-full bg-rf-secondary-container px-3 py-1 text-xs font-black text-white shadow-sm">
          {listing.status.replaceAll("_", " ")}
        </span>
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-extrabold text-rf-primary">
            {merchantName}
          </p>
          <p className="text-xs font-bold text-rf-text-muted">
            {merchantDistance !== undefined ? `${merchantDistance} km` : ""}
          </p>
        </div>
        <h3 className="text-xl font-black leading-snug text-rf-text-onyx">
          {listing.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-rf-text-muted">
          {listing.description}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-rf-control bg-rf-surface-container-low p-3">
            <p className="text-[11px] font-black uppercase tracking-wider text-rf-text-muted">
              Impact
            </p>
            <p className="mt-1 text-sm font-black text-rf-success">
              {listing.impactKgCo2}kg CO2 saved
            </p>
          </div>
          <div className="rounded-rf-control bg-rf-surface-container-low p-3">
            <p className="text-[11px] font-black uppercase tracking-wider text-rf-text-muted">
              Safety
            </p>
            <p className="mt-1 text-sm font-black text-rf-text-onyx">
              Eat by {listing.consumeBefore}
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-rf-text-muted">
              Pickup
            </p>
            <p className="mt-1 text-sm font-extrabold text-rf-text-onyx">
              {listing.pickupWindow}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-rf-text-muted line-through">
              Rp{listing.originalPrice.toLocaleString("id-ID")}
            </p>
            <p className="text-xl font-black text-rf-primary">
              Rp{(listing.currentPrice ?? listing.rescuePrice).toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SummaryChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-full border border-rf-outline-variant bg-rf-surface-base px-4 py-2">
      <span className="text-xs font-extrabold text-rf-text-muted">{label}</span>
      <span className="ml-2 text-xs font-black text-rf-primary">{value}</span>
    </div>
  );
}
