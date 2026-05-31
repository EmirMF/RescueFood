"use client";

import { useCallback, useEffect, useState } from "react";
import { secureFetch } from "@/lib/secure-fetch";

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    try {
      const response = await secureFetch("/api/wishlist");
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result; // Handle both { data: [...] } and [...]
        
        // Validate data is array
        if (Array.isArray(data)) {
          const ids = new Set<string>(data.map((item: { listingId: string }) => item.listingId));
          setWishlistIds(ids);
        } else {
          console.error("Wishlist data is not an array:", data);
          setWishlistIds(new Set());
        }
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    async function loadWishlist() {
      await fetchWishlist();
      if (mounted) {
        setLoading(false);
      }
    }
    
    loadWishlist();
    
    return () => {
      mounted = false;
    };
  }, [fetchWishlist]);

  const toggleWishlist = useCallback(async (listingId: string) => {
    const isInWishlist = wishlistIds.has(listingId);

    // Optimistic update
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (isInWishlist) {
        next.delete(listingId);
      } else {
        next.add(listingId);
      }
      return next;
    });

    try {
      if (isInWishlist) {
        // Find wishlist item ID and delete
        const response = await secureFetch("/api/wishlist");
        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          
          if (Array.isArray(data)) {
            const item = data.find((w: { listingId: string }) => w.listingId === listingId);
            if (item) {
              await secureFetch(`/api/wishlist/${item.id}`, { method: "DELETE" });
            }
          }
        }
      } else {
        // Add to wishlist
        const response = await secureFetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId }),
        });

        if (!response.ok) {
          throw new Error("Failed to add to wishlist");
        }
      }
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
      // Revert optimistic update on error
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (isInWishlist) {
          next.add(listingId);
        } else {
          next.delete(listingId);
        }
        return next;
      });
    }
  }, [wishlistIds]);

  const isInWishlist = useCallback(
    (listingId: string) => wishlistIds.has(listingId),
    [wishlistIds]
  );

  return {
    wishlistIds,
    loading,
    toggleWishlist,
    isInWishlist,
    refetch: fetchWishlist,
  };
}
