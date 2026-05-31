"use client";

import { useCallback, useState, useEffect } from "react";
import { ReviewModal } from "./review-modal";
import { secureFetch } from "@/lib/secure-fetch";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: {
    id: string;
    name: string;
  };
};

type OrderReviewSectionProps = {
  orderId: string;
  orderStatus: string;
  merchantName: string;
  currentUserId: string;
};

export function OrderReviewSection({
  orderId,
  orderStatus,
  merchantName,
  currentUserId,
}: OrderReviewSectionProps) {
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchReview = useCallback(async () => {
    try {
      const response = await secureFetch(`/api/orders/${orderId}/review`);
      const result = await response.json();

      if (response.ok && result.data) {
        setReview(result.data);
      }
    } catch (error) {
      console.error("Error fetching review:", error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void currentUserId;
    const timeout = window.setTimeout(fetchReview, 0);
    return () => window.clearTimeout(timeout);
  }, [currentUserId, fetchReview]);

  const isCompleted = orderStatus === "completed" || orderStatus === "COMPLETED";

  if (loading) {
    return (
      <div className="rounded-rf-card bg-rf-surface-base p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
        <p className="text-sm text-rf-text-muted">Loading...</p>
      </div>
    );
  }

  // Jika sudah ada review, tampilkan review
  if (review) {
    return (
      <div className="rounded-rf-card bg-rf-surface-base p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
            Review Anda
          </h3>
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
          <p className="text-sm text-rf-text-onyx leading-relaxed">
            {review.comment}
          </p>
        )}

        <p className="mt-3 text-xs text-rf-text-muted">
          {new Date(review.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    );
  }

  // Jika order completed dan belum ada review, tampilkan tombol review
  if (isCompleted) {
    return (
      <>
        <div className="rounded-rf-card bg-rf-surface-base p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary mb-3">
            Bagaimana pengalaman Anda?
          </h3>
          <p className="text-sm text-rf-text-muted mb-4">
            Bantu customer lain dengan memberikan rating dan review untuk merchant ini.
          </p>
          <button
            onClick={() => setShowReviewModal(true)}
            className="w-full rounded-rf-button bg-rf-primary px-6 py-3 text-sm font-extrabold text-white hover:bg-rf-primary-dark transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">rate_review</span>
            Beri Rating & Review
          </button>
        </div>

        <ReviewModal
          orderId={orderId}
          merchantName={merchantName}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            fetchReview();
          }}
        />
      </>
    );
  }

  // Jika order belum completed, tidak tampilkan apa-apa
  return null;
}
