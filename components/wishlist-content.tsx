"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { secureFetch } from "@/lib/secure-fetch";
import { FavoriteButton } from "./favorite-button";

type WishlistItem = {
  id: string;
  listingId: string;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    originalPrice: number;
    discountedPrice: number;
    currentPrice?: number;
    platformFee?: number;
    mode: string;
    status: string;
    pickupStartTime: string;
    pickupEndTime: string;
    merchant: {
      businessName: string;
      address: string;
    };
  };
};

export function WishlistContent() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlist() {
      try {
        const response = await secureFetch("/api/wishlist");
        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          setWishlist(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-rf-surface-container" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-xl bg-rf-surface-container" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-bold text-rf-text-onyx">
          Wishlist Saya
        </h1>
        <p className="mt-2 text-rf-text-muted">
          {wishlist.length} listing tersimpan
        </p>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <WishlistCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-rf-outline-variant bg-rf-surface-base p-16 text-center">
          <span className="material-symbols-outlined mx-auto block text-6xl text-rf-outline">
            favorite_border
          </span>
          <h3 className="mt-4 text-xl font-bold text-rf-text-onyx">
            Wishlist masih kosong
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-rf-text-muted">
            Mulai tambahkan listing favorit Anda dengan klik icon hati pada listing yang Anda suka.
          </p>
          <Link
            href="/marketplace"
            className="rf-focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-rf-primary-container px-6 py-3 text-sm font-semibold text-white hover:bg-rf-primary-fixed hover:text-rf-text-onyx"
          >
            <span className="material-symbols-outlined">search</span>
            Jelajahi Marketplace
          </Link>
        </div>
      )}
    </div>
  );
}

function WishlistCard({ 
  item
}: { 
  item: WishlistItem;
}) {
  const listing = item.listing;
  const displayPrice = listing.currentPrice ?? listing.discountedPrice;
  const discount = `${Math.max(0, Math.round((1 - displayPrice / listing.originalPrice) * 100))}% OFF`;

  const pickupStart = new Date(listing.pickupStartTime);
  const pickupEnd = new Date(listing.pickupEndTime);
  const pickupWindow = `${pickupStart.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}, ${pickupStart.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}-${pickupEnd.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group overflow-hidden rounded-xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(21,128,61,0.08)]"
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          alt={listing.title}
          src={listing.imageUrl}
          width={640}
          height={420}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 rounded bg-rf-primary-container px-2 py-1 text-xs font-bold text-white">
          {discount}
        </div>
        <div className="absolute right-3 top-3" onClick={(e) => e.preventDefault()}>
          <FavoriteButton listingId={listing.id} />
        </div>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="truncate font-heading text-xl font-semibold leading-7 text-rf-text-onyx">
          {listing.title}
        </h3>
        <p className="flex items-center gap-1 text-sm text-rf-text-muted">
          <span className="material-symbols-outlined text-xs">storefront</span>
          {listing.merchant.businessName}
        </p>
        <p className="flex items-center gap-1 text-xs text-rf-outline">
          <span className="material-symbols-outlined text-xs">schedule</span>
          {pickupWindow}
        </p>
        <div className="flex items-center gap-2 pt-2">
          <span className="font-bold text-rf-primary">
            {displayPrice === 0 ? "Gratis" : `Rp ${displayPrice.toLocaleString("id-ID")}`}
          </span>
          {displayPrice > 0 ? (
            <span className="text-xs text-rf-outline line-through">
              Rp {listing.originalPrice.toLocaleString("id-ID")}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
