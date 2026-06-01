"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { secureFetch } from "@/lib/secure-fetch";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess: (result: unknown) => void;
          onPending: (result: unknown) => void;
          onError: (result: unknown) => void;
          onClose: () => void;
        }
      ) => void;
    };
  }
}

interface PaymentCheckoutProps {
  order: {
    id: string;
    totalPrice: number;
    adminFee: number;
    quantity: number;
    listing: {
      title: string;
      imageUrl: string;
      merchantName: string;
    };
    paymentStatus: string;
    midtransToken: string | null;
  };
  midtransConfig: {
    clientKey: string;
    snapScriptUrl: string;
    isProduction: boolean;
    demoMode: boolean;
  };
}

export function PaymentCheckout({ order, midtransConfig }: PaymentCheckoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const subtotal = Math.max(0, order.totalPrice - order.adminFee);
  const [notice, setNotice] = useState("");
  const [snapLoaded, setSnapLoaded] = useState(midtransConfig.demoMode);

  const goToOrderDetail = useCallback((query = "payment=success") => {
    router.replace(`/orders/${order.id}?${query}`);
    router.refresh();
  }, [order.id, router]);

  const syncPaymentStatus = useCallback(async () => {
    const response = await secureFetch(`/api/orders/${order.id}/payment/sync`, {
      method: "POST",
    });
    const result = await response.json();

    if (!response.ok || !result.data) {
      throw new Error(result.error ?? "Failed to sync payment status");
    }

    return result.data as {
      paymentStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
    };
  }, [order.id]);

  // Load Midtrans Snap script (skip in demo mode)
  useEffect(() => {
    if (midtransConfig.demoMode) {
      return;
    }

    const script = document.createElement("script");
    script.src = midtransConfig.snapScriptUrl;
    script.setAttribute("data-client-key", midtransConfig.clientKey);
    script.onload = () => setSnapLoaded(true);
    script.onerror = () => setError("Failed to load payment gateway");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [midtransConfig]);

  useEffect(() => {
    if (order.paymentStatus === "PAID") {
      goToOrderDetail("payment=success");
      return;
    }

    if (!order.midtransToken) {
      return;
    }

    const gatewayStatus = searchParams.get("gateway");
    let cancelled = false;

    async function syncAndRedirectWhenPaid() {
      try {
        const synced = await syncPaymentStatus();

        if (cancelled) {
          return;
        }

        if (synced.paymentStatus === "PAID") {
          goToOrderDetail("payment=success");
          return;
        }

        if (gatewayStatus === "finish") {
          setNotice(
            "Pembayaran sedang diverifikasi. Halaman ini akan berpindah otomatis setelah status sukses.",
          );
        }
      } catch {
        if (gatewayStatus === "finish") {
          setNotice(
            "Pembayaran diterima gateway, tapi status server belum bisa diverifikasi. Coba beberapa detik lagi.",
          );
        }
      }
    }

    syncAndRedirectWhenPaid();
    const interval = window.setInterval(syncAndRedirectWhenPaid, 3000);
    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
    }, gatewayStatus === "finish" ? 30000 : 12000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [
    goToOrderDetail,
    order.midtransToken,
    order.paymentStatus,
    searchParams,
    syncPaymentStatus,
  ]);

  async function handlePayment() {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      let token = order.midtransToken;

      // If no token yet, create payment
      if (!token) {
        const response = await secureFetch(`/api/orders/${order.id}/payment`, {
          method: "POST",
        });

        const result = await response.json();

        if (!response.ok || !result.data) {
          setError(result.error || "Failed to create payment");
          setLoading(false);
          return;
        }

        token = result.data.token;
      }

      // Demo mode: simulate payment
      if (midtransConfig.demoMode) {
        // Show demo payment dialog
        const confirmed = window.confirm(
          `DEMO MODE\n\n` +
          `Order: ${order.listing.title}\n` +
          `Total: Rp ${order.totalPrice.toLocaleString("id-ID")}\n\n` +
          `Klik OK untuk simulasi pembayaran berhasil.\n` +
          `Klik Cancel untuk simulasi pembayaran gagal.`
        );

        if (confirmed) {
          try {
            await syncPaymentStatus();
            goToOrderDetail("payment=success&demo=true");
          } catch {
            setError("Failed to update order status");
            setLoading(false);
          }
        } else {
          setError("Payment cancelled");
          setLoading(false);
        }
        return;
      }

      // Real Midtrans payment
      if (window.snap && token) {
        window.snap.pay(token, {
          onSuccess: async (result) => {
            console.log("Payment success:", result);

            try {
              const synced = await syncPaymentStatus();

              if (synced.paymentStatus === "PAID") {
                goToOrderDetail("payment=success");
                return;
              }

              setNotice(
                "Pembayaran berhasil di gateway, tapi status server masih diproses. Coba cek status lagi dalam beberapa detik.",
              );
              setLoading(false);
              setTimeout(async () => {
                try {
                  const retry = await syncPaymentStatus();
                  if (retry.paymentStatus === "PAID") {
                    goToOrderDetail("payment=success");
                  } else {
                    router.refresh();
                  }
                } catch {
                  router.refresh();
                }
              }, 2500);
            } catch (syncError) {
              console.error("Payment sync error:", syncError);
              setError(
                "Pembayaran sukses, tapi status belum bisa diverifikasi. Coba refresh halaman pembayaran.",
              );
              setLoading(false);
            }
          },
          onPending: async (result) => {
            console.log("Payment pending:", result);
            try {
              await syncPaymentStatus();
            } catch (syncError) {
              console.error("Payment pending sync error:", syncError);
            }
            setNotice(
              "Pembayaran masih pending. Jangan tutup halaman ini sampai pembayaran sukses. Order belum aktif dan QR pickup belum bisa dipakai.",
            );
            setLoading(false);
            router.refresh();
          },
          onError: (result) => {
            console.error("Payment error:", result);
            setError("Payment failed. Please try again.");
            setLoading(false);
          },
          onClose: () => {
            console.log("Payment popup closed");
            setNotice(
              "Popup pembayaran ditutup. Order belum aktif karena pembayaran belum sukses.",
            );
            setLoading(false);
            router.refresh();
          },
        });
      } else {
        setError("Payment gateway not ready");
        setLoading(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("Failed to process payment");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[800px] mx-auto px-5 md:px-16 py-12">
      {/* Demo Mode Badge */}
      {midtransConfig.demoMode && (
        <div className="mb-6 bg-secondary-container rounded-lg p-4 border-2 border-secondary">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">info</span>
            <div>
              <p className="font-label-md text-label-md text-on-surface">
                🎭 DEMO MODE AKTIF
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                Pembayaran akan disimulasikan tanpa gateway real. Klik &quot;Bayar Sekarang&quot; untuk simulasi.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-lg text-on-background mb-2">
          Pembayaran
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Selesaikan pembayaran untuk melanjutkan pesanan Anda
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-surface-container-lowest rounded-xl p-6 mb-6" style={{ boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.04)" }}>
        <h2 className="font-title-md text-title-md text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          Ringkasan Pesanan
        </h2>

        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-outline-variant/20">
          <div className="w-20 h-20 rounded-lg bg-surface-container overflow-hidden flex-shrink-0 relative">
            <Image
              src={order.listing.imageUrl}
              alt={order.listing.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-grow">
            <h3 className="font-label-md text-label-md text-on-surface">
              {order.listing.title}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              {order.listing.merchantName}
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              Jumlah: {order.quantity} item
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
            <span>Biaya Platform</span>
            <span>Rp {order.adminFee.toLocaleString("id-ID")}</span>
          </div>
          <div className="h-[1px] bg-outline-variant/20 my-3"></div>
          <div className="flex justify-between items-center font-title-md text-title-md text-on-surface">
            <span>Total Pembayaran</span>
            <span className="text-primary">Rp {order.totalPrice.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods Info */}
      <div className="bg-surface-container-lowest rounded-xl p-6 mb-6" style={{ boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.04)" }}>
        <h2 className="font-title-md text-title-md text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">payment</span>
          Metode Pembayaran
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-4">
          Anda dapat membayar menggunakan:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface-container rounded-lg p-3 text-center">
            <span className="font-label-sm text-label-sm text-on-surface">QRIS</span>
          </div>
          <div className="bg-surface-container rounded-lg p-3 text-center">
            <span className="font-label-sm text-label-sm text-on-surface">GoPay</span>
          </div>
          <div className="bg-surface-container rounded-lg p-3 text-center">
            <span className="font-label-sm text-label-sm text-on-surface">ShopeePay</span>
          </div>
          <div className="bg-surface-container rounded-lg p-3 text-center">
            <span className="font-label-sm text-label-sm text-on-surface">Virtual Account</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-container rounded-lg p-4 mb-6">
          <p className="font-label-md text-label-md text-error flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {error}
          </p>
        </div>
      )}

      {notice && (
        <div className="mb-6 rounded-lg bg-rf-surface-container-low p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-rf-text-muted">
            <span className="material-symbols-outlined text-[20px] text-rf-primary">
              info
            </span>
            {notice}
          </p>
        </div>
      )}

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading || !snapLoaded}
        className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 px-6 rounded-full hover:bg-primary-container transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            Memproses...
          </>
        ) : !snapLoaded ? (
          <>
            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            Loading Payment Gateway...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[20px]">credit_card</span>
            Bayar Sekarang
          </>
        )}
      </button>

      <p className="text-center font-body-md text-body-md text-on-surface-variant text-sm mt-4">
        Dengan melanjutkan, Anda menyetujui syarat dan ketentuan pembayaran
      </p>
    </div>
  );
}
