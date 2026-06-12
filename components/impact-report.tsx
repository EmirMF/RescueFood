"use client";

import Link from "next/link";

type Props = {
  role: "CUSTOMER" | "MERCHANT" | "CHARITY" | "ADMIN" | null;
  mealsRescued: number;
  co2SavedGrams: number;
  merchantCount: number;
  topListings: { id: string; title: string; merchantName: string; co2SavedGrams: number; quantity: number; status: string }[];
  recentActivity: { id: string; listingTitle: string; co2SavedGrams: number; createdAt: string }[];
  customerData: { myMeals: number; myCo2Grams: number; moneySaved: number } | null;
  merchantData: { storeOrders: number; storeMeals: number; storeCo2Grams: number; storeRevenue: number; topListing: { title: string; co2SavedGrams: number } | null } | null;
  adminData: { revenueGenerated: number; platformFeesCollected: number; activeSubscribers: number; todayAssignments: number; orderBreakdown: { status: string; count: number }[] } | null;
};

function formatCo2(grams: number) {
  if (grams === 0) return "0 g";
  if (grams < 1000) return `${grams} g`;
  return `${(grams / 1000).toFixed(2)} kg`;
}

function formatRp(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:   "bg-rf-primary text-white",
  SOLD_OUT: "bg-amber-400 text-white",
  EXPIRED:  "bg-rf-text-muted/30 text-rf-text-muted",
  REMOVED:  "bg-rf-error/20 text-rf-error",
  DRAFT:    "bg-rf-outline-variant/30 text-rf-text-muted",
};

export function ImpactReport({
  role,
  mealsRescued,
  co2SavedGrams,
  merchantCount,
  topListings,
  recentActivity,
  customerData,
  merchantData,
  adminData,
}: Props) {
  return (
    <div className="grid gap-8">

      {/* ── Section 1: Public aggregate (all roles + guests) ── */}
      <section>
        <h2 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-rf-text-muted">
          Platform impact
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard icon="restaurant" label="Meals rescued" value={mealsRescued.toLocaleString("id-ID")} detail="Total porsi dari semua order selesai" color="primary" />
          <MetricCard icon="co2" label="CO2 diselamatkan" value={formatCo2(co2SavedGrams)} detail="Estimasi AI dari listing yang terjual" color="secondary" />
          <MetricCard icon="storefront" label="Partner merchant" value={merchantCount.toLocaleString("id-ID")} detail="Merchant terverifikasi aktif" color="primary" />
        </div>
      </section>

      {/* ── Section 2: Customer personal contribution ── */}
      {role === "CUSTOMER" && customerData && (
        <section>
          <h2 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-rf-text-muted">
            Kontribusi kamu
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard icon="lunch_dining" label="Meals yang kamu rescue" value={customerData.myMeals.toLocaleString("id-ID")} detail="Order selesai atas namamu" color="primary" />
            <MetricCard icon="eco" label="CO2 kamu selamatkan" value={formatCo2(customerData.myCo2Grams)} detail="Dari listing yang kamu beli" color="secondary" />
            <MetricCard icon="savings" label="Uang dihemat" value={formatRp(customerData.moneySaved)} detail="Selisih harga normal vs harga rescue" color="tertiary" />
          </div>
          {customerData.myMeals === 0 && (
            <p className="mt-3 rounded-xl bg-rf-surface-container-low px-4 py-3 text-sm font-semibold text-rf-text-muted">
              Belum ada order selesai. Mulai rescue makanan di{" "}
              <a href="/marketplace" className="font-extrabold text-rf-primary underline">marketplace</a>!
            </p>
          )}
        </section>
      )}

      {/* ── Section 3: Merchant store contribution ── */}
      {role === "MERCHANT" && merchantData && (
        <section>
          <h2 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-rf-text-muted">
            Dampak toko kamu
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard icon="inventory_2" label="Order terpenuhi" value={merchantData.storeOrders.toLocaleString("id-ID")} detail="Order COMPLETED dari toko kamu" color="primary" />
            <MetricCard icon="restaurant" label="Porsi terselamatkan" value={merchantData.storeMeals.toLocaleString("id-ID")} detail="Total quantity dari order selesai" color="secondary" />
            <MetricCard icon="eco" label="CO2 dari tokomu" value={formatCo2(merchantData.storeCo2Grams)} detail="Estimasi CO2 via AI" color="secondary" />
            <MetricCard icon="payments" label="Revenue toko" value={formatRp(merchantData.storeRevenue)} detail="Dari order yang sudah dibayar" color="primary" />
          </div>
          {merchantData.topListing && (
            <div className="mt-4 rounded-xl bg-rf-surface-container-low px-5 py-4">
              <p className="text-xs font-extrabold uppercase tracking-wider text-rf-secondary">Listing terbaik</p>
              <p className="mt-1 font-bold text-rf-text-onyx">{merchantData.topListing.title}</p>
              <p className="text-sm font-semibold text-rf-text-muted">CO2: {formatCo2(merchantData.topListing.co2SavedGrams)}</p>
            </div>
          )}
        </section>
      )}

      {/* ── Section 4: Admin-only full dashboard ── */}
      {role === "ADMIN" && adminData && (
        <section>
          <h2 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-rf-text-muted">
            Platform dashboard (admin only)
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard icon="attach_money" label="Gross revenue" value={formatRp(adminData.revenueGenerated)} detail="Total dari paid orders" color="primary" />
            <MetricCard icon="percent" label="Platform fee (10%)" value={formatRp(adminData.platformFeesCollected)} detail="Komisi yang terkumpul" color="secondary" />
            <MetricCard icon="subscriptions" label="Subscriber aktif" value={adminData.activeSubscribers.toLocaleString("id-ID")} detail={`${adminData.todayAssignments} di-assign hari ini`} color="tertiary" />
            <MetricCard icon="receipt_long" label="Total order" value={adminData.orderBreakdown.reduce((s, b) => s + b.count, 0).toLocaleString("id-ID")} detail="Semua status" color="primary" />
          </div>

          <div className="mt-4 rounded-xl bg-rf-surface-base p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
            <p className="text-xs font-extrabold uppercase tracking-wider text-rf-secondary">Order breakdown</p>
            <div className="mt-4 grid gap-3">
              {adminData.orderBreakdown.map((b) => {
                const total = adminData.orderBreakdown.reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? Math.round((b.count / total) * 100) : 0;
                return (
                  <div key={b.status}>
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-rf-text-onyx">{b.status}</span>
                      <span className="text-rf-text-muted">{b.count} ({pct}%)</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-rf-surface-container-low">
                      <div className="h-2 rounded-full bg-rf-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Section 5: Top listings + recent activity (all roles) ── */}
      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-xl bg-rf-surface-base p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-extrabold uppercase tracking-wider text-rf-secondary">Top CO2 impact</p>
          <h2 className="mt-1 text-2xl font-black text-rf-text-onyx">Listing dengan CO2 terbesar</h2>
          <div className="mt-5 grid gap-2">
            {topListings.length === 0 ? (
              <p className="text-sm text-rf-text-muted">Belum ada listing.</p>
            ) : topListings.map((l) => (
              <Link key={l.id} href={`/listings/${l.id}`}
                className="flex items-center justify-between gap-4 rounded-lg bg-rf-surface-container-low px-4 py-3 transition hover:bg-rf-surface-container"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-rf-text-onyx">{l.title}</p>
                  <p className="text-xs font-semibold text-rf-text-muted">{l.merchantName} · {l.quantity} porsi</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${STATUS_COLORS[l.status] ?? "bg-rf-surface-container text-rf-text-muted"}`}>
                    {l.status}
                  </span>
                  <span className="whitespace-nowrap rounded-full bg-rf-primary/10 px-3 py-1 text-xs font-extrabold text-rf-primary">
                    {formatCo2(l.co2SavedGrams)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-rf-surface-base p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-extrabold uppercase tracking-wider text-rf-secondary">Aktivitas terbaru</p>
          <h2 className="mt-1 text-2xl font-black text-rf-text-onyx">Rescue terbaru</h2>
          <div className="mt-5 grid gap-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-rf-text-muted">Belum ada order selesai.</p>
            ) : recentActivity.map((a) => (
              <div key={a.id} className="rounded-lg bg-rf-surface-container-low px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-bold text-rf-text-onyx">{a.listingTitle}</p>
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-rf-primary/10 px-2 py-0.5 text-xs font-extrabold text-rf-primary">
                    {formatCo2(a.co2SavedGrams)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-rf-text-muted">{formatDate(a.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

function MetricCard({
  icon, label, value, detail, color,
}: {
  icon: string; label: string; value: string; detail: string; color: "primary" | "secondary" | "tertiary";
}) {
  const bg = { primary: "bg-rf-primary/10 text-rf-primary", secondary: "bg-rf-secondary/10 text-rf-secondary", tertiary: "bg-rf-tertiary-container/20 text-rf-tertiary" }[color];
  const text = { primary: "text-rf-primary", secondary: "text-rf-secondary", tertiary: "text-rf-tertiary" }[color];

  return (
    <div className="rounded-xl bg-rf-surface-base p-5 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
      <div className={`mb-3 flex size-10 items-center justify-center rounded-full ${bg}`}>
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <p className={`text-3xl font-black ${text}`}>{value}</p>
      <p className="mt-1 text-sm font-extrabold text-rf-text-onyx">{label}</p>
      <p className="mt-1 text-xs font-semibold leading-5 text-rf-text-muted">{detail}</p>
    </div>
  );
}
