"use client";

import { useState } from "react";
import { secureFetch } from "@/lib/secure-fetch";
import type { VerificationTarget } from "@/lib/admin-data";

type VerificationStatus = "pending" | "approved" | "rejected";

type QueueItem = VerificationTarget & { status: VerificationStatus };

export function AdminVerificationDashboard({
  initialQueue = [],
}: {
  initialQueue?: QueueItem[];
}) {
  const [overrides, setOverrides] = useState<Record<string, VerificationStatus>>(
    {},
  );
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const queue = initialQueue.map((target) => ({
    ...target,
    status: overrides[target.id] ?? target.status,
  }));
  const summary = getVerificationSummary(queue);

  async function changeStatus(target: QueueItem, status: VerificationStatus) {
    setMessage("");
    setSavingId(target.id);

    try {
      const response = await secureFetch(
        `/api/admin/verification/${target.type}/${target.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );
      const result = await response.json();

      if (!response.ok || !result.data) {
        setMessage(result.error ?? "Status belum bisa disimpan ke backend.");
        return;
      }

      setOverrides((current) => ({ ...current, [target.id]: status }));
      setMessage(
        status === "approved"
          ? "Merchant approved. Merchant sekarang bisa mempublikasikan listing."
          : "Merchant rejected. Listing aktif merchant ditarik dari marketplace dan akses publikasi dikunci.",
      );
    } catch {
      setMessage("API tidak terhubung. Status belum tersimpan.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Pending" value={summary.pending} />
        <Metric label="Approved" value={summary.approved} />
        <Metric label="Rejected" value={summary.rejected} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section className="rounded-rf-card bg-rf-surface-base p-5 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
        <div className="mb-5">
          <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
            Verification queue
          </p>
          <h2 className="mt-1 text-2xl font-black text-rf-text-onyx">
            Merchant pending
          </h2>
        </div>

        <div className="grid gap-3">
          {message && (
            <p className="rounded-rf-control bg-rf-secondary-fixed px-4 py-3 text-sm font-extrabold text-rf-secondary">
              {message}
            </p>
          )}
          {queue.map((target) => (
            <article
              key={target.id}
              className="rounded-rf-card border border-rf-outline-variant/60 bg-rf-surface-container-low p-4"
            >
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-rf-primary-fixed px-3 py-1 text-xs font-extrabold text-rf-primary">
                      {target.type}
                    </span>
                    <span className="rounded-full bg-rf-secondary-fixed px-3 py-1 text-xs font-extrabold text-rf-secondary">
                      {target.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-rf-text-onyx">
                    {target.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-rf-text-muted">
                    {target.location} · {target.notes}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={savingId === target.id || target.status === "approved"}
                    onClick={() => changeStatus(target, "approved")}
                    className="rf-focus-ring rounded-rf-control bg-rf-primary-container px-4 py-2 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:bg-rf-outline-variant disabled:text-rf-text-muted"
                  >
                    {savingId === target.id ? "Saving..." : "Approve"}
                  </button>
                  <button
                    type="button"
                    disabled={savingId === target.id || target.status === "rejected"}
                    onClick={() => changeStatus(target, "rejected")}
                    className="rf-focus-ring rounded-rf-control border border-rf-outline-variant px-4 py-2 text-sm font-extrabold text-rf-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="h-fit rounded-rf-card bg-rf-surface-base p-5 shadow-[0px_20px_40px_rgba(21,128,61,0.08)]">
        <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
          Trust summary
        </p>
        <h2 className="mt-1 text-2xl font-black text-rf-text-onyx">
          Governance status
        </h2>
        <div className="mt-5 grid gap-3">
          <Metric label="Pending" value={summary.pending} />
          <Metric label="Approved" value={summary.approved} />
          <Metric label="Rejected" value={summary.rejected} />
        </div>
        <div className="mt-5 rounded-rf-control bg-rf-surface-container-low p-4">
          <p className="text-xs font-extrabold uppercase tracking-wider text-rf-text-muted">
            Review policy
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-rf-text-onyx">
            Verifikasi legalitas, lokasi, kapasitas distribusi, dan riwayat
            operasional sebelum memberi akses publikasi.
          </p>
        </div>
      </aside>
      </div>
    </div>
  );
}

function getVerificationSummary(queue: QueueItem[]) {
  return {
    pending: queue.filter((item) => item.status === "pending").length,
    approved: queue.filter((item) => item.status === "approved").length,
    rejected: queue.filter((item) => item.status === "rejected").length,
  };
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-rf-control bg-rf-surface-container-low p-4">
      <p className="text-2xl font-black text-rf-primary">{value}</p>
      <p className="mt-1 text-sm font-bold text-rf-text-muted">{label}</p>
    </div>
  );
}
