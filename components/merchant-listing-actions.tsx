"use client";
import { secureFetch } from "@/lib/secure-fetch";

import { useState } from "react";
import type { FoodListing, ListingStatus } from "@/lib/types";

type MerchantListingActionsProps = {
  listing: FoodListing;
  onStatusChange: (listingId: string, status: ListingStatus) => void;
};

export function MerchantListingActions({
  listing,
  onStatusChange,
}: MerchantListingActionsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function updateStatus(nextStatus: ListingStatus) {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await secureFetch(`/api/listings/${listing.id}`, {
        method: nextStatus === "removed" ? "DELETE" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body:
          nextStatus === "removed"
            ? undefined
            : JSON.stringify({
                status:
                  nextStatus === "sold_out"
                    ? "SOLD_OUT"
                    : nextStatus === "active"
                      ? "ACTIVE"
                      : "EXPIRED",
              }),
      });
      const result = await response.json();

      if (!response.ok || !result.data) {
        setMessage(result.error ?? "Status listing belum bisa diperbarui.");
        return;
      }

      onStatusChange(listing.id, nextStatus);
      setMessage("Status tersimpan.");
    } catch {
      setMessage("API tidak terhubung.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={isSaving || listing.status === "active"}
        onClick={() => updateStatus("active")}
        className="rf-focus-ring rounded-rf-control border border-rf-outline-variant px-3 py-2 text-xs font-extrabold text-rf-primary disabled:cursor-not-allowed disabled:text-rf-text-muted"
      >
        Publish
      </button>
      <button
        type="button"
        disabled={isSaving || listing.status === "sold_out"}
        onClick={() => updateStatus("sold_out")}
        className="rf-focus-ring rounded-rf-control border border-rf-outline-variant px-3 py-2 text-xs font-extrabold text-rf-primary disabled:cursor-not-allowed disabled:text-rf-text-muted"
      >
        Sold out
      </button>
      <button
        type="button"
        disabled={isSaving || listing.status === "removed"}
        onClick={() => updateStatus("removed")}
        className="rf-focus-ring rounded-rf-control border border-rf-outline-variant px-3 py-2 text-xs font-extrabold text-rf-primary disabled:cursor-not-allowed disabled:text-rf-text-muted"
      >
        Remove
      </button>
      {message && (
        <span className="text-xs font-bold text-rf-text-muted">{message}</span>
      )}
    </div>
  );
}
