"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { secureFetch } from "@/lib/secure-fetch";
import { useSessionRole } from "@/components/role-switcher";
import { roleLabels } from "@/lib/session";
import type { FoodListing } from "@/lib/types";

// Limit per customer per order
const MAX_QUANTITY_PER_CUSTOMER = 5;

export function ListingActionPanel({ listing }: { listing: FoodListing }) {
  const router = useRouter();
  const role = useSessionRole();
  const [status, setStatus] = useState<"idle" | "saving" | "submitted">("idle");
  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  const isSaleListing = listing.type === "sale";
  const canAct = isSaleListing && role === "customer";

  const buttonLabel = !isSaleListing
    ? "Listing tidak tersedia"
    : role === "customer"
      ? "Pesan sekarang"
      : "Masuk sebagai customer untuk pesan";

  const maxQuantity = listing.quantity || 1;
  const availableQuantity = listing.status === "active" ? maxQuantity : 0;
  
  // Limit quantity per customer
  const maxAllowedQuantity = Math.min(maxQuantity, MAX_QUANTITY_PER_CUSTOMER);

  function handleQuantityChange(newQuantity: number) {
    if (newQuantity >= 1 && newQuantity <= maxAllowedQuantity) {
      setQuantity(newQuantity);
    }
  }

  async function submitAction() {
    // Prevent spam clicking
    if (status === "saving" || status === "submitted") {
      return;
    }

    // Clear any existing timeout
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }

    setStatus("saving");
    setMessage("");

    try {
      const response = await secureFetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId: listing.id,
          quantity: quantity,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.data) {
        setMessage(
          result.error ??
            "Belum bisa menyimpan ke backend. Pastikan role sudah login.",
        );
        
        // Reset status after 2 seconds to allow retry
        submitTimeoutRef.current = setTimeout(() => {
          setStatus("idle");
        }, 2000);
        return;
      }

      const orderId = result.data.id;
      router.push(`/payment/${orderId}`);
    } catch {
      setMessage("API belum terhubung. Coba lagi setelah server berjalan.");
      
      // Reset status after 2 seconds to allow retry
      submitTimeoutRef.current = setTimeout(() => {
        setStatus("idle");
      }, 2000);
    }
  }

  return (
    <div>
      <div className="rounded-rf-control bg-rf-surface-container-low p-4">
        <p className="text-xs font-extrabold uppercase tracking-wider text-rf-text-muted">
          Role aktif
        </p>
        <p className="mt-1 text-sm font-extrabold text-rf-text-onyx">
          {role ? roleLabels[role] : "Belum login"}
        </p>
      </div>

      {/* Quantity Selector */}
      {canAct && availableQuantity > 0 && status !== "submitted" && (
        <div className="mt-4 rounded-rf-control bg-rf-surface-container-low p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-rf-text-muted">
                Jumlah
              </p>
              <p className="mt-1 text-xs text-rf-text-muted">
                Tersedia: {availableQuantity} item
              </p>
              {maxAllowedQuantity < maxQuantity && (
                <p className="mt-0.5 text-xs text-rf-primary font-semibold">
                  Max per customer: {MAX_QUANTITY_PER_CUSTOMER} item
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || status === "saving"}
                className="rf-focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-rf-outline-variant bg-rf-surface-base text-rf-primary transition hover:bg-rf-surface-container disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </button>
              <span className="min-w-[3rem] text-center text-xl font-bold text-rf-text-onyx">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= maxAllowedQuantity || status === "saving"}
                className="rf-focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-rf-outline-variant bg-rf-surface-base text-rf-primary transition hover:bg-rf-surface-container disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={!canAct || status === "saving" || status === "submitted" || availableQuantity === 0}
        onClick={submitAction}
        className="rf-focus-ring mt-4 w-full rounded-rf-control bg-rf-primary-container px-5 py-4 text-sm font-extrabold text-white transition hover:bg-rf-primary disabled:cursor-not-allowed disabled:bg-rf-outline-variant disabled:text-rf-text-muted"
      >
        {status === "saving"
          ? "Menyimpan..."
          : status === "submitted"
            ? "Permintaan tercatat"
            : availableQuantity === 0
              ? "Stok habis"
              : buttonLabel}
      </button>

      <p className="mt-4 text-center text-xs font-semibold leading-5 text-rf-text-muted">
        {message
          ? message
          : status === "submitted"
            ? "Permintaan sudah tersimpan."
            : availableQuantity === 0
              ? "Listing ini sudah tidak tersedia."
              : "Pickup divalidasi merchant memakai kode sederhana pada tahap MVP."}
      </p>
    </div>
  );
}
