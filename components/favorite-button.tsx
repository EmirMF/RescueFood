"use client";

import { useWishlist } from "@/lib/use-wishlist";
import { useSessionRole } from "./role-switcher";

export function FavoriteButton({ 
  listingId, 
  className = "" 
}: { 
  listingId: string; 
  className?: string;
}) {
  const role = useSessionRole();
  const { isInWishlist, toggleWishlist, loading } = useWishlist();
  const isFavorited = isInWishlist(listingId);

  // Only show for logged-in customers
  if (!role || role !== "customer") {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(listingId);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`rounded-full bg-rf-surface/80 p-2 backdrop-blur transition hover:bg-rf-surface ${
        isFavorited 
          ? "text-rf-error hover:text-rf-error/80" 
          : "text-rf-text-muted hover:text-rf-primary"
      } ${className}`}
      type="button"
      aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
    >
      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0" }}>
        favorite
      </span>
    </button>
  );
}
