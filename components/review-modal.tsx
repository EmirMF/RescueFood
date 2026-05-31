"use client";

import { useState } from "react";
import { secureFetch } from "@/lib/secure-fetch";

type ReviewModalProps = {
  orderId: string;
  merchantName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function ReviewModal({
  orderId,
  merchantName,
  isOpen,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Silakan pilih rating");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await secureFetch(`/api/orders/${orderId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, comment }),
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
        // Reset form
        setRating(0);
        setComment("");
      } else {
        setError(result.error || "Gagal mengirim review");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (!submitting) {
      onClose();
      setError("");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-rf-card bg-rf-surface-base p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black text-rf-text-onyx">
            Beri Rating & Review
          </h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-rf-text-muted hover:text-rf-text-onyx transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <p className="text-sm text-rf-text-muted mb-6">
          Bagaimana pengalaman Anda dengan <span className="font-bold text-rf-text-onyx">{merchantName}</span>?
        </p>

        <form onSubmit={handleSubmit}>
          {/* Rating Stars */}
          <div className="mb-6">
            <label className="block text-sm font-extrabold text-rf-text-onyx mb-3">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <span
                    className="material-symbols-outlined text-[40px]"
                    style={{
                      fontVariationSettings:
                        star <= (hoveredRating || rating) ? "'FILL' 1" : "'FILL' 0",
                      color:
                        star <= (hoveredRating || rating)
                          ? "#F59E0B"
                          : "#D1D5DB",
                    }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-extrabold text-rf-text-onyx mb-2">
              Komentar (Opsional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ceritakan pengalaman Anda..."
              rows={4}
              disabled={submitting}
              className="w-full rounded-rf-control bg-rf-surface-container-low border-none focus:ring-2 focus:ring-rf-primary px-4 py-3 text-sm text-rf-text-onyx placeholder:text-rf-text-muted resize-none disabled:opacity-50"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-rf-control bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 rounded-rf-button bg-rf-surface-container-low px-6 py-3 text-sm font-extrabold text-rf-text-onyx hover:bg-rf-surface-container transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="flex-1 rounded-rf-button bg-rf-primary px-6 py-3 text-sm font-extrabold text-white hover:bg-rf-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Mengirim..." : "Kirim Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
