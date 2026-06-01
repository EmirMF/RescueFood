"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { secureFetch } from "@/lib/secure-fetch";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type OrderStatus =
  | "PENDING" | "CONFIRMED" | "READY_FOR_PICKUP"
  | "COMPLETED" | "CANCELLED" | "EXPIRED";
type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
type UserRole = "CUSTOMER" | "MERCHANT" | "CHARITY" | "ADMIN";
type UserStatus = "ACTIVE" | "SUSPENDED";
type ListingStatus = "DRAFT" | "ACTIVE" | "SOLD_OUT" | "EXPIRED" | "REMOVED";
type ListingMode = "SALE" | "DONATION";

interface DashboardStats {
  totalUsers: number; totalMerchants: number;
  pendingMerchants: number; verifiedMerchants: number; rejectedMerchants: number;
  totalListings: number; activeListings: number;
  totalOrders: number; completedOrders: number; cancelledOrders: number; pendingOrders: number;
  totalDonationClaims: number; completedDonationClaims: number;
  foodSavedKg: number; totalRevenue: number;
}
interface RecentOrder {
  id: string; customerName: string; customerEmail: string;
  listingTitle: string; merchantName: string; quantity: number;
  totalPrice: number; status: OrderStatus; paymentStatus: PaymentStatus; createdAt: string;
}
interface UserRow {
  id: string; name: string; email: string;
  role: UserRole; status: UserStatus; createdAt: string;
}
interface ListingRow {
  id: string; title: string; category: string;
  merchantName: string; merchantVerified: boolean;
  mode: ListingMode; status: ListingStatus;
  originalPrice: number; discountedPrice: number;
  quantity: number; orderCount: number; createdAt: string;
}
interface TopMerchant {
  id: string; businessName: string; ownerName: string; address: string;
  averageRating: number; completedOrders: number; activeListings: number;
  verificationStatus: string;
}
interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  allUsers: UserRow[];
  topMerchants: TopMerchant[];
  allListings: ListingRow[];
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}
function formatDate(s: string) {
  return new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
function formatDateShort(s: string) {
  return new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

/* ─── Config maps ────────────────────────────────────────────────────────── */
const orderStatusCfg: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  PENDING:          { label: "Pending",   color: "text-amber-700",   bg: "bg-amber-50" },
  CONFIRMED:        { label: "Confirmed", color: "text-blue-700",    bg: "bg-blue-50" },
  READY_FOR_PICKUP: { label: "Ready",     color: "text-purple-700",  bg: "bg-purple-50" },
  COMPLETED:        { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-50" },
  CANCELLED:        { label: "Cancelled", color: "text-red-700",     bg: "bg-red-50" },
  EXPIRED:          { label: "Expired",   color: "text-gray-600",    bg: "bg-gray-100" },
};
const listingStatusCfg: Record<ListingStatus, { label: string; color: string; bg: string }> = {
  ACTIVE:   { label: "Aktif",    color: "text-emerald-700", bg: "bg-emerald-50" },
  DRAFT:    { label: "Draft",    color: "text-gray-600",    bg: "bg-gray-100" },
  SOLD_OUT: { label: "Habis",    color: "text-blue-700",    bg: "bg-blue-50" },
  EXPIRED:  { label: "Expired",  color: "text-amber-700",   bg: "bg-amber-50" },
  REMOVED:  { label: "Dinonaktifkan", color: "text-red-700", bg: "bg-red-50" },
};
const roleCfg: Record<UserRole, { label: string; color: string; bg: string; icon: string }> = {
  CUSTOMER: { label: "Customer", color: "text-blue-700",    bg: "bg-blue-50",    icon: "person" },
  MERCHANT: { label: "Merchant", color: "text-amber-700",   bg: "bg-amber-50",   icon: "storefront" },
  CHARITY:  { label: "Charity",  color: "text-purple-700",  bg: "bg-purple-50",  icon: "volunteer_activism" },
  ADMIN:    { label: "Admin",    color: "text-emerald-700", bg: "bg-emerald-50", icon: "admin_panel_settings" },
};

/* ─── Confirm Dialog ─────────────────────────────────────────────────────── */
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: "red" | "green";
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}
function ConfirmDialog({ open, title, message, confirmLabel, confirmColor, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className={`mb-4 flex size-12 items-center justify-center rounded-full ${confirmColor === "red" ? "bg-red-100" : "bg-emerald-100"}`}>
          <span className={`material-symbols-outlined text-2xl ${confirmColor === "red" ? "text-red-600" : "text-emerald-600"}`}
            style={{ fontVariationSettings: "'FILL' 1" }}>
            {confirmColor === "red" ? "warning" : "check_circle"}
          </span>
        </div>
        <h3 className="mb-2 font-heading text-lg font-bold text-rf-text-onyx">{title}</h3>
        <p className="mb-6 text-sm leading-relaxed text-rf-text-muted">{message}</p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} disabled={loading}
            className="flex-1 rounded-full border-2 border-rf-outline-variant py-2.5 text-sm font-semibold text-rf-text-muted transition hover:border-rf-text-onyx hover:text-rf-text-onyx disabled:opacity-50">
            Batal
          </button>
          <button type="button" onClick={onConfirm} disabled={loading}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold text-white transition active:scale-[0.97] disabled:opacity-60
              ${confirmColor === "red" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Memproses...
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Toast notification ─────────────────────────────────────────────────── */
interface ToastProps { message: string; type: "success" | "error" }
function Toast({ message, type }: ToastProps) {
  return (
    <div className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-xl
      ${type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
        {type === "success" ? "check_circle" : "error"}
      </span>
      {message}
    </div>
  );
}

/* ─── StatCard ───────────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, color = "primary" }:
  { icon: string; label: string; value: string | number; sub?: string; color?: "primary"|"warning"|"error"|"success"|"neutral" }) {
  const c = {
    primary: { icon: "text-rf-primary", badge: "bg-rf-primary-fixed/40" },
    warning: { icon: "text-amber-600",  badge: "bg-amber-100" },
    error:   { icon: "text-red-600",    badge: "bg-red-100" },
    success: { icon: "text-emerald-600",badge: "bg-emerald-100" },
    neutral: { icon: "text-rf-text-muted", badge: "bg-rf-surface-container" },
  }[color];
  return (
    <div className="rf-card-surface flex flex-col justify-between rounded-2xl p-5">
      <div className="mb-3 flex items-start justify-between">
        <div className={`flex size-11 items-center justify-center rounded-xl ${c.badge}`}>
          <span className={`material-symbols-outlined text-2xl ${c.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
      </div>
      <div>
        <p className="font-heading text-3xl font-extrabold leading-none text-rf-text-onyx">{value}</p>
        <p className="mt-1 text-sm font-semibold text-rf-text-muted">{label}</p>
        {sub && <p className="mt-0.5 text-xs text-rf-text-muted">{sub}</p>}
      </div>
    </div>
  );
}

function ProgressBar({ value, max, color = "primary" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const cls = color === "primary" ? "bg-rf-primary" : color === "warning" ? "bg-amber-500" : color === "error" ? "bg-red-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-rf-surface-container">
        <div className={`h-full rounded-full transition-all ${cls}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs font-bold text-rf-text-muted">{pct}%</span>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export function AdminDashboard({ data: initialData }: { data: DashboardData }) {
  const [data, setData] = useState(initialData);
  const { stats, recentOrders, allUsers, topMerchants, allListings } = data;

  const [activeSection, setActiveSection] = useState<"overview"|"orders"|"users"|"listings">("overview");
  const [orderSearch, setOrderSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [listingSearch, setListingSearch] = useState("");
  const [listingFilter, setListingFilter] = useState<ListingStatus | "ALL">("ALL");
  const [userRoleFilter, setUserRoleFilter] = useState<UserRole | "ALL">("ALL");

  // Confirm dialog state
  const [confirm, setConfirm] = useState<{
    open: boolean; title: string; message: string;
    confirmLabel: string; confirmColor: "red"|"green";
    action: () => Promise<void>;
  }>({ open: false, title: "", message: "", confirmLabel: "", confirmColor: "red", action: async () => {} });
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success"|"error" } | null>(null);

  const showToast = useCallback((message: string, type: "success"|"error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const runConfirm = useCallback(async () => {
    setConfirmLoading(true);
    try {
      await confirm.action();
    } finally {
      setConfirmLoading(false);
      setConfirm(c => ({ ...c, open: false }));
    }
  }, [confirm]);

  /* ── User moderation ── */
  const handleUserAction = useCallback((user: UserRow, action: "suspend"|"activate") => {
    const isSuspend = action === "suspend";
    setConfirm({
      open: true,
      title: isSuspend ? `Nonaktifkan Akun?` : `Aktifkan Akun?`,
      message: isSuspend
        ? `Akun "${user.name}" akan ditangguhkan. User tidak bisa login. ${user.role === "MERCHANT" ? "Semua listing aktifnya akan dinonaktifkan." : ""}`
        : `Akun "${user.name}" akan diaktifkan kembali dan bisa login seperti biasa.`,
      confirmLabel: isSuspend ? "Nonaktifkan" : "Aktifkan",
      confirmColor: isSuspend ? "red" : "green",
      action: async () => {
        const res = await secureFetch(`/api/admin/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        const result = await res.json();
        if (!res.ok) {
          showToast(result.error ?? "Gagal mengubah status akun.", "error");
          return;
        }
        // Update local state
        setData(d => ({
          ...d,
          allUsers: d.allUsers.map(u =>
            u.id === user.id ? { ...u, status: isSuspend ? "SUSPENDED" : "ACTIVE" } : u
          ),
          // Jika merchant suspend, hapus listing aktifnya dari daftar (set ke REMOVED)
          allListings: isSuspend && user.role === "MERCHANT"
            ? d.allListings.map(l =>
                l.merchantName === user.name && (l.status === "ACTIVE" || l.status === "DRAFT")
                  ? { ...l, status: "REMOVED" as ListingStatus }
                  : l
              )
            : d.allListings,
        }));
        showToast(
          isSuspend ? `Akun "${user.name}" berhasil dinonaktifkan.` : `Akun "${user.name}" berhasil diaktifkan.`,
          "success"
        );
      },
    });
  }, [showToast]);

  /* ── Listing moderation ── */
  const handleListingAction = useCallback((listing: ListingRow, action: "remove"|"activate") => {
    const isRemove = action === "remove";
    setConfirm({
      open: true,
      title: isRemove ? "Nonaktifkan Listing?" : "Aktifkan Listing?",
      message: isRemove
        ? `Listing "${listing.title}" akan dinonaktifkan dan tidak muncul di marketplace.`
        : `Listing "${listing.title}" akan diaktifkan kembali dan tampil di marketplace.`,
      confirmLabel: isRemove ? "Nonaktifkan" : "Aktifkan",
      confirmColor: isRemove ? "red" : "green",
      action: async () => {
        const res = await secureFetch(`/api/admin/listings/${listing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        const result = await res.json();
        if (!res.ok) {
          showToast(result.error ?? "Gagal mengubah status listing.", "error");
          return;
        }
        setData(d => ({
          ...d,
          allListings: d.allListings.map(l =>
            l.id === listing.id
              ? { ...l, status: (isRemove ? "REMOVED" : "ACTIVE") as ListingStatus }
              : l
          ),
        }));
        showToast(
          isRemove ? `Listing "${listing.title}" dinonaktifkan.` : `Listing "${listing.title}" diaktifkan.`,
          "success"
        );
      },
    });
  }, [showToast]);

  /* ── Filtered data ── */
  const filteredOrders = recentOrders.filter(o =>
    [o.customerName, o.listingTitle, o.merchantName].some(s =>
      s.toLowerCase().includes(orderSearch.toLowerCase())
    )
  );
  const filteredUsers = allUsers.filter(u => {
    const matchRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
    const matchSearch = [u.name, u.email].some(s => s.toLowerCase().includes(userSearch.toLowerCase()));
    return matchRole && matchSearch;
  });
  const filteredListings = allListings.filter(l => {
    const matchStatus = listingFilter === "ALL" || l.status === listingFilter;
    const matchSearch = [l.title, l.merchantName].some(s => s.toLowerCase().includes(listingSearch.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const completionRate = stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0;
  const verificationRate = stats.totalMerchants > 0 ? Math.round((stats.verifiedMerchants / stats.totalMerchants) * 100) : 0;
  const suspendedCount = allUsers.filter(u => u.status === "SUSPENDED").length;
  const removedListings = allListings.filter(l => l.status === "REMOVED").length;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        confirmColor={confirm.confirmColor}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(c => ({ ...c, open: false }))}
        loading={confirmLoading}
      />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="rf-kicker">Admin Panel</p>
            <h1 className="mt-1 font-heading text-3xl font-extrabold leading-tight text-rf-text-onyx md:text-4xl">
              Dashboard Overview
            </h1>
            <p className="mt-2 text-base text-rf-text-muted">
              Monitor aktivitas platform RescueFood secara real-time.
            </p>
          </div>
          <Link
            href="/admin/verification"
            className="flex items-center gap-2 self-start rounded-full border-2 border-rf-primary px-5 py-2.5 text-sm font-semibold text-rf-primary transition-all hover:bg-rf-primary hover:text-white active:scale-[0.97] md:self-auto"
          >
            <span className="material-symbols-outlined text-xl">verified_user</span>
            Verifikasi Merchant
            {stats.pendingMerchants > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white">
                {stats.pendingMerchants > 9 ? "9+" : stats.pendingMerchants}
              </span>
            )}
          </Link>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-rf-surface-container p-1">
          {(["overview","orders","users","listings"] as const).map(tab => {
            const meta = {
              overview:  { label: "Overview",   icon: "dashboard" },
              orders:    { label: "Transaksi",  icon: "receipt_long" },
              users:     { label: "Pengguna",   icon: "group" },
              listings:  { label: "Listing",    icon: "storefront" },
            }[tab];
            const badge = tab === "users" && suspendedCount > 0 ? suspendedCount
              : tab === "listings" && removedListings > 0 ? removedListings : 0;
            return (
              <button key={tab} type="button" onClick={() => setActiveSection(tab)}
                className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all whitespace-nowrap
                  ${activeSection === tab ? "bg-white text-rf-primary shadow-sm" : "text-rf-text-muted hover:text-rf-text-onyx"}`}>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: activeSection === tab ? "'FILL' 1" : "'FILL' 0" }}>{meta.icon}</span>
                {meta.label}
                {badge > 0 && (
                  <span className="flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white">{badge > 9 ? "9+" : badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ═══ OVERVIEW ════════════════════════════════════════════════════ */}
        {activeSection === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard icon="group"        label="Total Pengguna"          value={stats.totalUsers}        sub="Customer, Merchant & Charity" color="primary" />
              <StatCard icon="storefront"   label="Total Merchant"           value={stats.totalMerchants}    sub={`${stats.verifiedMerchants} terverifikasi`} color="warning" />
              <StatCard icon="receipt_long" label="Total Order"              value={stats.totalOrders}       sub={`${completionRate}% completion rate`} color="success" />
              <StatCard icon="eco"          label="Makanan Terselamatkan"    value={`${stats.foodSavedKg} kg`} sub="Estimasi dampak total" color="primary" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard icon="pending_actions" label="Menunggu Verifikasi" value={stats.pendingMerchants}          sub="Merchant pending"        color="warning" />
              <StatCard icon="check_circle"    label="Order Selesai"       value={stats.completedOrders}            color="success" />
              <StatCard icon="inventory_2"     label="Listing Aktif"       value={stats.activeListings}             sub={`dari ${stats.totalListings} total`} color="neutral" />
              <StatCard icon="block"           label="Akun Suspended"      value={suspendedCount}                   sub="Perlu perhatian" color={suspendedCount > 0 ? "error" : "neutral"} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Merchant verification */}
              <div className="rf-card-surface rounded-2xl p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div><p className="rf-kicker">Merchant</p><h2 className="mt-1 font-heading text-xl font-bold text-rf-text-onyx">Status Verifikasi</h2></div>
                  <Link href="/admin/verification" className="flex items-center gap-1 rounded-full bg-rf-primary-fixed/40 px-3 py-1.5 text-xs font-bold text-rf-primary hover:bg-rf-primary hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">open_in_new</span>Kelola
                  </Link>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Verified", value: stats.verifiedMerchants, color: "success" as const },
                    { label: "Pending",  value: stats.pendingMerchants,  color: "warning" as const },
                    { label: "Rejected", value: stats.rejectedMerchants, color: "error"   as const },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`size-2.5 rounded-full ${color === "success" ? "bg-emerald-500" : color === "warning" ? "bg-amber-500" : "bg-red-500"}`} />
                          <span className="text-sm font-semibold text-rf-text-onyx">{label}</span>
                        </div>
                        <span className="text-sm font-bold text-rf-text-muted">{value}</span>
                      </div>
                      <ProgressBar value={value} max={stats.totalMerchants} color={color} />
                    </div>
                  ))}
                  <div className="mt-2 rounded-xl bg-rf-surface-container-low p-3 text-center">
                    <p className="text-xs text-rf-text-muted">Verification Rate</p>
                    <p className="font-heading text-2xl font-extrabold text-rf-primary">{verificationRate}%</p>
                  </div>
                </div>
              </div>

              {/* Order funnel */}
              <div className="rf-card-surface rounded-2xl p-6">
                <div className="mb-4"><p className="rf-kicker">Transaksi</p><h2 className="mt-1 font-heading text-xl font-bold text-rf-text-onyx">Status Order</h2></div>
                <div className="space-y-4">
                  {[
                    { label: "Pending",   value: stats.pendingOrders,   color: "warning" as const, icon: "hourglass_empty" },
                    { label: "Completed", value: stats.completedOrders, color: "success" as const, icon: "check_circle" },
                    { label: "Cancelled", value: stats.cancelledOrders, color: "error"   as const, icon: "cancel" },
                  ].map(({ label, value, color, icon }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className={`flex size-9 items-center justify-center rounded-lg ${color === "success" ? "bg-emerald-100 text-emerald-600" : color === "warning" ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"}`}>
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-semibold text-rf-text-onyx">{label}</span>
                          <span className="text-sm font-bold text-rf-text-muted">{value}</span>
                        </div>
                        <ProgressBar value={value} max={stats.totalOrders} color={color} />
                      </div>
                    </div>
                  ))}
                  <div className="mt-2 rounded-xl bg-rf-primary/5 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-rf-text-muted">Total Revenue</span>
                      <span className="font-heading text-lg font-extrabold text-rf-primary">{formatCurrency(stats.totalRevenue)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top merchants */}
            {topMerchants.length > 0 && (
              <div className="rf-card-surface rounded-2xl p-6">
                <div className="mb-5"><p className="rf-kicker">Leaderboard</p><h2 className="mt-1 font-heading text-xl font-bold text-rf-text-onyx">Top Merchant</h2></div>
                <div className="space-y-3">
                  {topMerchants.map((m, i) => (
                    <div key={m.id} className="flex items-center gap-4 rounded-xl border border-rf-outline-variant/40 p-4 hover:bg-rf-surface-container-low transition-colors">
                      <div className={`flex size-9 shrink-0 items-center justify-center rounded-full font-heading text-sm font-extrabold
                        ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-rf-surface-container text-rf-text-muted"}`}>
                        #{i+1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-semibold text-rf-text-onyx">{m.businessName}</p>
                        <p className="truncate text-xs text-rf-text-muted">{m.address}</p>
                      </div>
                      <div className="hidden items-center gap-4 text-sm md:flex">
                        <div className="text-center"><p className="font-bold text-rf-text-onyx">{m.completedOrders}</p><p className="text-xs text-rf-text-muted">Orders</p></div>
                        <div className="text-center"><p className="font-bold text-rf-text-onyx">{m.activeListings}</p><p className="text-xs text-rf-text-muted">Listings</p></div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="font-bold text-rf-text-onyx">{m.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ TRANSAKSI ═══════════════════════════════════════════════════ */}
        {activeSection === "orders" && (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div><p className="rf-kicker">Manajemen</p><h2 className="font-heading text-2xl font-bold text-rf-text-onyx">Transaksi Terbaru</h2></div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-rf-text-muted text-xl">search</span>
                <input type="search" placeholder="Cari order..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
                  className="rf-focus-ring w-full rounded-xl border border-rf-outline-variant bg-rf-surface py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-rf-text-muted/60 focus:border-rf-primary focus:ring-2 focus:ring-rf-primary/20 md:w-72" />
              </div>
            </div>
            <div className="rf-card-surface overflow-hidden rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-rf-outline-variant/30 bg-rf-surface-container-low">
                      {["Order ID","Customer","Listing","Merchant","Qty","Total","Status","Tgl"].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-rf-text-muted whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rf-outline-variant/20">
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan={8} className="px-4 py-12 text-center text-rf-text-muted">
                        <span className="material-symbols-outlined block text-4xl mb-2">receipt_long</span>Tidak ada order ditemukan
                      </td></tr>
                    ) : filteredOrders.map(order => {
                      const sc = orderStatusCfg[order.status];
                      return (
                        <tr key={order.id} className="hover:bg-rf-surface-container-low/50 transition-colors">
                          <td className="px-4 py-3"><span className="font-mono text-xs text-rf-text-muted">#{order.id.slice(-6).toUpperCase()}</span></td>
                          <td className="px-4 py-3"><p className="text-sm font-semibold text-rf-text-onyx whitespace-nowrap">{order.customerName}</p><p className="text-xs text-rf-text-muted truncate max-w-[130px]">{order.customerEmail}</p></td>
                          <td className="px-4 py-3"><p className="text-sm font-medium text-rf-text-onyx max-w-[130px] truncate">{order.listingTitle}</p></td>
                          <td className="px-4 py-3"><p className="text-sm text-rf-text-muted whitespace-nowrap">{order.merchantName}</p></td>
                          <td className="px-4 py-3 text-sm font-semibold text-rf-text-onyx">{order.quantity}</td>
                          <td className="px-4 py-3"><span className="text-sm font-semibold text-rf-text-onyx whitespace-nowrap">{formatCurrency(order.totalPrice)}</span></td>
                          <td className="px-4 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${sc.bg} ${sc.color}`}>{sc.label}</span></td>
                          <td className="px-4 py-3 text-xs text-rf-text-muted whitespace-nowrap">{formatDateShort(order.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══ PENGGUNA ════════════════════════════════════════════════════ */}
        {activeSection === "users" && (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="rf-kicker">Manajemen Akun</p>
                <h2 className="font-heading text-2xl font-bold text-rf-text-onyx">Semua Pengguna</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value as UserRole | "ALL")}
                  className="rounded-xl border border-rf-outline-variant bg-rf-surface px-3 py-2 text-sm text-rf-text-onyx outline-none focus:border-rf-primary">
                  <option value="ALL">Semua Role</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="MERCHANT">Merchant</option>
                  <option value="CHARITY">Charity</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-rf-text-muted text-xl">search</span>
                  <input type="search" placeholder="Cari pengguna..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
                    className="rf-focus-ring w-full rounded-xl border border-rf-outline-variant bg-rf-surface py-2 pl-10 pr-4 text-sm outline-none placeholder:text-rf-text-muted/60 focus:border-rf-primary focus:ring-2 focus:ring-rf-primary/20 md:w-60" />
                </div>
              </div>
            </div>

            {/* Role summary pills */}
            <div className="flex flex-wrap gap-2">
              {(["ALL","CUSTOMER","MERCHANT","CHARITY","ADMIN"] as const).map(r => {
                const count = r === "ALL" ? allUsers.length : allUsers.filter(u => u.role === r).length;
                const cfg = r === "ALL" ? { label: "Semua", color: "text-rf-text-muted", bg: "bg-rf-surface-container" } : roleCfg[r];
                return (
                  <button key={r} type="button" onClick={() => setUserRoleFilter(r)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all
                      ${userRoleFilter === r ? `${cfg.bg} ${cfg.color} ring-2 ring-current ring-offset-1` : "bg-rf-surface-container text-rf-text-muted hover:text-rf-text-onyx"}`}>
                    {count} {cfg.label}
                  </button>
                );
              })}
              {suspendedCount > 0 && (
                <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>block</span>
                  {suspendedCount} Suspended
                </span>
              )}
            </div>

            <div className="rf-card-surface overflow-hidden rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-rf-outline-variant/30 bg-rf-surface-container-low">
                      {["Pengguna","Email","Role","Status","Bergabung","Aksi"].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-rf-text-muted whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rf-outline-variant/20">
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-12 text-center text-rf-text-muted">
                        <span className="material-symbols-outlined block text-4xl mb-2">group</span>Tidak ada pengguna ditemukan
                      </td></tr>
                    ) : filteredUsers.map(user => {
                      const rc = roleCfg[user.role];
                      const isAdmin = user.role === "ADMIN";
                      const isSuspended = user.status === "SUSPENDED";
                      return (
                        <tr key={user.id} className={`hover:bg-rf-surface-container-low/50 transition-colors ${isSuspended ? "opacity-60" : ""}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isSuspended ? "bg-gray-100 text-gray-400" : "bg-rf-primary/10 text-rf-primary"}`}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-semibold text-rf-text-onyx whitespace-nowrap">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-rf-text-muted max-w-[180px] truncate">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${rc.bg} ${rc.color}`}>
                              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>{rc.icon}</span>
                              {rc.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold
                              ${isSuspended ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {isSuspended ? "block" : "check_circle"}
                              </span>
                              {isSuspended ? "Suspended" : "Aktif"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-rf-text-muted whitespace-nowrap">{formatDate(user.createdAt)}</td>
                          <td className="px-4 py-3">
                            {isAdmin ? (
                              <span className="text-xs text-rf-text-muted italic">—</span>
                            ) : isSuspended ? (
                              <button type="button" onClick={() => handleUserAction(user, "activate")}
                                className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-200 active:scale-95">
                                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                Aktifkan
                              </button>
                            ) : (
                              <button type="button" onClick={() => handleUserAction(user, "suspend")}
                                className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-200 active:scale-95">
                                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>block</span>
                                Nonaktifkan
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══ LISTING ═════════════════════════════════════════════════════ */}
        {activeSection === "listings" && (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="rf-kicker">Moderasi Listing</p>
                <h2 className="font-heading text-2xl font-bold text-rf-text-onyx">Semua Listing</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <select value={listingFilter} onChange={e => setListingFilter(e.target.value as ListingStatus | "ALL")}
                  className="rounded-xl border border-rf-outline-variant bg-rf-surface px-3 py-2 text-sm text-rf-text-onyx outline-none focus:border-rf-primary">
                  <option value="ALL">Semua Status</option>
                  <option value="ACTIVE">Aktif</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SOLD_OUT">Habis</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="REMOVED">Dinonaktifkan</option>
                </select>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-rf-text-muted text-xl">search</span>
                  <input type="search" placeholder="Cari listing..." value={listingSearch} onChange={e => setListingSearch(e.target.value)}
                    className="rf-focus-ring w-full rounded-xl border border-rf-outline-variant bg-rf-surface py-2 pl-10 pr-4 text-sm outline-none placeholder:text-rf-text-muted/60 focus:border-rf-primary focus:ring-2 focus:ring-rf-primary/20 md:w-60" />
                </div>
              </div>
            </div>

            {/* Status summary pills */}
            <div className="flex flex-wrap gap-2">
              {(["ALL","ACTIVE","DRAFT","SOLD_OUT","EXPIRED","REMOVED"] as const).map(s => {
                const count = s === "ALL" ? allListings.length : allListings.filter(l => l.status === s).length;
                if (count === 0 && s !== "ALL" && s !== "ACTIVE") return null;
                const cfg = s === "ALL" ? { label: "Semua", color: "text-rf-text-muted", bg: "bg-rf-surface-container" } : listingStatusCfg[s];
                return (
                  <button key={s} type="button" onClick={() => setListingFilter(s)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all
                      ${listingFilter === s ? `${cfg.bg} ${cfg.color} ring-2 ring-current ring-offset-1` : "bg-rf-surface-container text-rf-text-muted hover:text-rf-text-onyx"}`}>
                    {count} {cfg.label}
                  </button>
                );
              })}
            </div>

            <div className="rf-card-surface overflow-hidden rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-rf-outline-variant/30 bg-rf-surface-container-low">
                      {["Listing","Merchant","Mode","Harga","Stok","Orders","Status","Aksi"].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-rf-text-muted whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rf-outline-variant/20">
                    {filteredListings.length === 0 ? (
                      <tr><td colSpan={8} className="px-4 py-12 text-center text-rf-text-muted">
                        <span className="material-symbols-outlined block text-4xl mb-2">inventory_2</span>Tidak ada listing ditemukan
                      </td></tr>
                    ) : filteredListings.map(listing => {
                      const sc = listingStatusCfg[listing.status];
                      const isRemoved = listing.status === "REMOVED";
                      const isExpiredOrSoldOut = listing.status === "EXPIRED" || listing.status === "SOLD_OUT";
                      return (
                        <tr key={listing.id} className={`hover:bg-rf-surface-container-low/50 transition-colors ${isRemoved ? "opacity-60" : ""}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${isRemoved ? "bg-gray-100" : "bg-rf-primary/10"}`}>
                                <span className={`material-symbols-outlined text-sm ${isRemoved ? "text-gray-400" : "text-rf-primary"}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                  {listing.mode === "DONATION" ? "volunteer_activism" : "lunch_dining"}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-rf-text-onyx max-w-[160px] truncate">{listing.title}</p>
                                <p className="text-xs text-rf-text-muted">{listing.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-rf-text-muted whitespace-nowrap">{listing.merchantName}</p>
                            <span className={`text-xs font-semibold ${listing.merchantVerified ? "text-emerald-600" : "text-amber-600"}`}>
                              {listing.merchantVerified ? "✓ Verified" : "⚠ Unverified"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold
                              ${listing.mode === "DONATION" ? "bg-purple-100 text-purple-700" : "bg-rf-primary-fixed/40 text-rf-primary"}`}>
                              {listing.mode === "DONATION" ? "Donasi" : "Jual"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {listing.mode === "DONATION" ? (
                              <span className="text-xs text-rf-text-muted italic">Gratis</span>
                            ) : (
                              <div>
                                <p className="text-sm font-semibold text-rf-primary whitespace-nowrap">{formatCurrency(listing.discountedPrice)}</p>
                                <p className="text-xs text-rf-text-muted line-through">{formatCurrency(listing.originalPrice)}</p>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-rf-text-onyx">{listing.quantity}</td>
                          <td className="px-4 py-3 text-sm text-rf-text-muted">{listing.orderCount}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${sc.bg} ${sc.color}`}>{sc.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            {isExpiredOrSoldOut ? (
                              <span className="text-xs text-rf-text-muted italic">—</span>
                            ) : isRemoved ? (
                              <button type="button" onClick={() => handleListingAction(listing, "activate")}
                                disabled={!listing.merchantVerified}
                                title={!listing.merchantVerified ? "Merchant belum terverifikasi" : undefined}
                                className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40">
                                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                Aktifkan
                              </button>
                            ) : (
                              <button type="button" onClick={() => handleListingAction(listing, "remove")}
                                className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-200 active:scale-95">
                                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>block</span>
                                Nonaktifkan
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
