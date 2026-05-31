"use client";

import { useState } from "react";
import { secureFetch } from "@/lib/secure-fetch";

export function AdminFeeSettings({ initialAdminFee }: { initialAdminFee: number }) {
  const [adminFee, setAdminFee] = useState(String(initialAdminFee));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function saveAdminFee() {
    setStatus("saving");

    try {
      const response = await secureFetch("/api/admin/settings/admin-fee", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminFee: Number(adminFee),
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.data) {
        setStatus("error");
        return;
      }

      setAdminFee(String(result.data.adminFee));
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mb-8 rounded-rf-card bg-rf-surface-base p-5 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
            Payment settings
          </p>
          <h2 className="mt-1 text-2xl font-black text-rf-text-onyx">
            Biaya admin flat per pesanan
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-rf-text-muted">
            Nilai ini akan menjadi snapshot pada order baru dan masuk ke total
            pembayaran Midtrans.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[320px]">
          <label className="grid gap-2">
            <span className="text-sm font-extrabold text-rf-text-onyx">
              Admin fee
            </span>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                step={500}
                value={adminFee}
                onChange={(event) => setAdminFee(event.target.value)}
                className="rf-focus-ring h-12 min-w-0 flex-1 rounded-rf-control border border-rf-outline-variant bg-rf-surface-container-low px-4 text-sm font-semibold outline-none focus:border-rf-primary"
              />
              <button
                type="button"
                onClick={saveAdminFee}
                disabled={status === "saving"}
                className="rf-focus-ring rounded-rf-control bg-rf-primary-container px-5 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:bg-rf-outline-variant"
              >
                {status === "saving" ? "Saving..." : "Save"}
              </button>
            </div>
          </label>
          {status === "saved" && (
            <p className="text-xs font-extrabold text-rf-primary">
              Biaya admin tersimpan.
            </p>
          )}
          {status === "error" && (
            <p className="text-xs font-extrabold text-rf-error">
              Biaya admin belum bisa disimpan.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
