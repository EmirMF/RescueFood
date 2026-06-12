"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { AppHeader } from "@/components/app-header";
import { FavoriteButton } from "@/components/favorite-button";
import { useSessionRole } from "@/components/role-switcher";
import { secureFetch } from "@/lib/secure-fetch";
import type { FoodCategory, FoodListing } from "@/lib/types";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBSIjV8i2cxiJjMZgQkFsJvVq2ZzLD4YAAyYH-HXYJtgZdhLtho1aDURfVeNXw5lyQQtpQ0awWBYzfSvr-KBscbkCuCdSOjMNUYztjzKvqW2lulnNMG4Xr4p3uyezVTNZI-44mPZzlnBhZyif1oyhqHh9mV-A2C-0Zdf2QsLhN-SPxtbZczdwzVawIcpvrFSjt4DeaYAJiFsBUVToAWByg8ZE6Qio_Rq2JFLnBTFpZWinv2h7x8hzdABmKbKsXWSgznhbZ65nJjuEZV";

const fallbackImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDu2vN_7nMIgT9gvrodxFOuyX7qym-v1FkYYDPMS3-fNuw_aDfi75xRhsxjtG9cydxEbOlYnOSd4c5jnKi59m4d_FaQc7yTjhR-Yilrsy1O2A76Yk2U8qMib4ob63_hQdm6wE42T7N1XyiexQAbXDO2ACledhCLEE2aNXmxVdCN33ELt37s2HImgrT_Y6uwSmGwPSJ4OJU12aOED1v3Me0gHvfeSADsYWVrRkonAWrkkM1noOYnFl8HM00YPT1XIFg3zduQsgpjUPMD",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAGp6CvD5WZkv5XqS0GPdVv3rK5JFa1SmIs54lOPdcPmWzyaFhHIIP8fl8QJbigMwMPBVqN_Il2kPsVHkh0-ruyMRq9pyRTWUkfF-RvtxLQyNgwSbHvU7WKdw0v_y6FXiPkJnl76IBDQfRXkdGDAozKBEN-OpP4yzIhDJXaU2gemswuchT-D6D9xHmkeTghJjCb_PYtLiWNMHKNO8JcnfareBHaVoMUy8Zx8oJ0CRspFGl-0AID1ai9TsV1gbwnHKbxzthUPNU2DVDj",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCFpRq75sh8MGuK_R6fTX4i0MgjJzhHix30ZKuusBmNXJvYavvCZf8UbGXFtCx9EUN9itmC6JaEzDNV89mlgXYwKkfEF_Ce6Wsspk37NukhS87h7g0FBbrVxRnQusRFilKxuXi2X0n2kiIB2u-iXxWhIH-n0aPuKyUQrnfrIkESOF4L4tCNQCClms4Kw3SNW-pAxyDFrKBLZ4aeYCDzmiwC1rfHXdDUw97JUm07uKrGC_LB-iRKaUjQVpILeSZEFli8zxX823roorVI",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAXLBBAjSbrYaL4KFIkjk6Fa0-YlZFZucPH_i0EwRBa6HwkYSxUP4WMM95zwenZKlriMDaveyuhYgXVUZhzTzwY8VuxMbEfwRRVekYlHnDnk8GBT4mtsJB-jTznY60aVP_NBXi_heH7NtrNI0BIkQ36lOxgDBcSNLFhKGEMVKGxyQLVIa_xqxt-OiTzhO9J2oZvv31Z1OZbvJRzDxgACXBKgbsmdfezRdbiDdWPs9Kd-B_V2_I-7J5TwFcGNu2CbpjYIF_j4VYib9Ms",
];

export function HomeContent({
  impactSummary,
  initialListings = [],
}: {
  impactSummary: {
    co2SavedKg: number;
    foodSavedKg: number;
    mealsRescued: number;
    partnerMerchants: number;
  };
  initialListings?: FoodListing[];
}) {
  const role = useSessionRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | "all">("all");
  const [filterType, setFilterType] = useState<"all" | "sale">("all");

  const [isSubscriber, setIsSubscriber] = useState<boolean | null>(null);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");
  const [assignState, setAssignState] = useState<"idle"|"locating"|"assigning"|"done"|"already"|"error">("idle");
  const [assignedMeal, setAssignedMeal] = useState<{title:string;merchantName:string;pickupLocation:string}|null>(null);
  const [assignError, setAssignError] = useState("");

  useEffect(() => {
    if (role === null) return;
    if (role !== "customer") { setIsSubscriber(false); return; }
    secureFetch("/api/subscriptions")
      .then(r => r.json())
      .then(result => { setIsSubscriber(result.data?.subscriptionStatus === "active"); })
      .catch(() => { setIsSubscriber(false); });
  }, [role]);

  async function handleSubscribe() {
    setSubscribeLoading(true);
    try {
      const res = await secureFetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();
      if (!res.ok) { setSubscribeLoading(false); return; }

      const { token, midtransConfig: cfg } = result.data;

      if (cfg.demoMode) {
        window.location.href = "/subscriptions/onboarding?payment=finish";
        return;
      }

      const loadSnap = () => new Promise<void>((resolve, reject) => {
        if (window.snap) { resolve(); return; }
        const script = document.createElement("script");
        script.src = cfg.snapScriptUrl;
        script.setAttribute("data-client-key", cfg.clientKey);
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Snap script failed to load"));
        document.head.appendChild(script);
      });

      await loadSnap();
      setSubscribeLoading(false);

      window.snap?.pay(token, {
        onSuccess: () => { window.location.href = "/subscriptions/onboarding?payment=finish"; },
        onPending: () => { window.location.href = "/subscriptions/onboarding?payment=pending"; },
        onError:   () => { /* stay on page */ },
        onClose:   () => { /* user closed popup */ },
      });
    } catch {
      setSubscribeLoading(false);
    }
  }

  async function claimDailyMeal() {
    if (!navigator.geolocation) { setAssignState("error"); setAssignError("Browser tidak mendukung geolocation."); return; }
    setAssignState("locating"); setAssignError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setAssignState("assigning");
        try {
          const res = await secureFetch("/api/subscriptions/assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          });
          const result = await res.json();
          if (!res.ok) { setAssignState("error"); setAssignError(result.error ?? "Gagal mengamankan porsi."); return; }
          if (!result.data?.isNew) { setAssignState("already"); }
          else { setAssignState("done"); setAssignedMeal(result.data.listing); }
        } catch { setAssignState("error"); setAssignError("Tidak bisa terhubung ke server."); }
      },
      (err) => { setAssignState("error"); setAssignError(err.code === 1 ? "Izin lokasi ditolak. Aktifkan di pengaturan browser." : "Lokasi tidak tersedia."); },
      { timeout: 8000 },
    );
  }
  const activeListings = initialListings.filter(
    (listing) =>
      listing.type === "sale" &&
      (listing.status === "active" || listing.status === "reserved"),
  );

  const filteredListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    return activeListings.filter((listing) => {
      const matchesSearch =
        query === "" ||
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.merchantName?.toLowerCase().includes(query) ||
        listing.merchantLocation?.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "all" || listing.category === selectedCategory;

      const matchesType =
        filterType === "all" || listing.type === filterType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [activeListings, searchQuery, selectedCategory, filterType]);

  const dashboardHref =
    role === "merchant"
      ? "/merchant"
      : role === "admin"
          ? "/admin/dashboard"
          : "/profile";

  return (
    <main className="min-h-screen bg-rf-surface text-rf-text-onyx">
      <AppHeader
        active="marketplace"
        showSession
        actions={role ? [] : [{ href: "/auth", label: "Masuk", variant: "primary" }]}
      />

      <div className="mx-auto max-w-[1280px] space-y-20 px-5 py-20 md:px-16">
        <section className="grid grid-cols-1 items-center gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-rf-surface-container px-4 py-2 text-sm font-semibold text-rf-primary">
              <span className="material-symbols-outlined text-sm">eco</span>
              Bersama kurangi limbah, berbagi kebaikan
            </div>
            <h1 className="font-heading text-5xl font-extrabold leading-[56px] tracking-[-0.02em] text-rf-text-onyx">
              Selamatkan Makanan, <br />
              <span className="text-rf-primary">Kurangi Limbah</span>
            </h1>
            <p className="max-w-md text-lg leading-7 tracking-[0.01em] text-rf-text-muted">
              Temukan makanan surplus berkualitas dari merchant lokal dengan
              harga hemat dan pickup yang terjadwal.
            </p>

            <div className="rf-glass-card mt-8 flex flex-col gap-4 rounded-xl p-4 md:flex-row">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-rf-outline">
                  search
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rf-focus-ring w-full rounded-lg border border-rf-outline-variant bg-rf-surface-container-lowest py-3 pl-12 pr-4 text-base outline-none focus:border-rf-primary"
                  placeholder="Cari makanan, merchant, atau lokasi..."
                  type="text"
                />
              </div>
              <div className="relative w-full md:w-auto">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-rf-primary">
                  location_on
                </span>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as "all" | "sale")}
                  className="rf-focus-ring w-full appearance-none rounded-lg border border-rf-outline-variant bg-rf-surface-container-lowest py-3 pl-12 pr-8 text-base outline-none focus:border-rf-primary md:w-48"
                >
                  <option value="all">Semua Tipe</option>
                  <option value="sale">Diskon</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-rf-outline">
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="#marketplace"
                className="rf-focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-rf-primary-container px-8 py-3 text-sm font-semibold text-white hover:bg-rf-primary-fixed hover:text-rf-text-onyx"
              >
                <span className="material-symbols-outlined">search</span>
                Cari Makanan
              </a>
              <Link
                href={role ? dashboardHref : "/auth"}
                className="rf-focus-ring inline-flex items-center justify-center gap-2 rounded-full border-2 border-rf-primary-container bg-rf-surface px-8 py-3 text-sm font-semibold text-rf-primary-container hover:bg-rf-surface-container-high"
              >
                <span className="material-symbols-outlined">favorite</span>
                {role ? "Buka Dashboard" : "Mulai Rescue"}
              </Link>
            </div>
          </div>

          <div className="relative flex h-[400px] items-center justify-center overflow-hidden rounded-[1.5rem] bg-rf-surface-container md:h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-rf-primary/10 to-white mix-blend-multiply" />
            <Image
              alt="Groceries in a paper bag"
              src={heroImage}
              width={900}
              height={700}
              priority
              className="h-full w-full rounded-[1.5rem] object-cover object-center shadow-lg mix-blend-darken"
            />
            <HeroBadge
              className="left-8 top-8"
              icon="trending_down"
              label="Hemat hingga"
              value="70%"
            />
            <HeroBadge
              className="bottom-8 right-8"
              icon="eco"
              label="Bantu kurangi"
              value="limbah makanan"
            />
          </div>
        </section>

        <section className="flex flex-wrap justify-center gap-4">
          <CategoryPill 
            icon="bakery_dining" 
            label="Bakery" 
            color="text-yellow-600"
            active={selectedCategory === "bakery"}
            onClick={() => setSelectedCategory(selectedCategory === "bakery" ? "all" : "bakery")}
          />
          <CategoryPill 
            icon="restaurant" 
            label="Meals" 
            color="text-green-600"
            active={selectedCategory === "rice_meal"}
            onClick={() => setSelectedCategory(selectedCategory === "rice_meal" ? "all" : "rice_meal")}
          />
          <CategoryPill 
            icon="local_cafe" 
            label="Drinks" 
            color="text-purple-500"
            active={selectedCategory === "beverage"}
            onClick={() => setSelectedCategory(selectedCategory === "beverage" ? "all" : "beverage")}
          />
          <CategoryPill 
            icon="near_me" 
            label="Nearby" 
            color="text-blue-500"
            active={false}
            onClick={() => {
              // TODO: Implement geolocation sorting
              alert("Fitur lokasi terdekat akan segera hadir!");
            }}
          />
        </section>

        {/* ── Membership section ── */}
        {role === "customer" && isSubscriber === false && (
          <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-rf-primary to-emerald-700 text-white shadow-[0px_20px_60px_rgba(21,128,61,0.30)]">
            <div className="grid gap-0 lg:grid-cols-[1fr_auto]">
              <div className="p-8 md:p-10">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:"'FILL' 1"}}>star</span>
                  RescueFood Membership
                </div>
                <h2 className="font-heading text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
                  1 porsi gratis<br />setiap hari — otomatis.
                </h2>
                <p className="mt-3 max-w-lg text-base font-semibold leading-7 text-white/80">
                  AI kami mencarikan makanan rescue dari merchant terdekat dalam radius 5km, menyesuaikan preferensi dietmu, dan mengamankan porsinya sebelum habis.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: "smart_toy",        text: "AI auto-assign setiap sore" },
                    { icon: "near_me",           text: "Merchant terdekat (<5km)" },
                    { icon: "no_food",           text: "Filter alergi otomatis" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3">
                      <span className="material-symbols-outlined text-lg" style={{fontVariationSettings:"'FILL' 1"}}>{icon}</span>
                      <span className="text-sm font-semibold">{text}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleSubscribe}
                    disabled={subscribeLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-extrabold text-rf-primary shadow-lg transition hover:bg-rf-surface-container disabled:opacity-60"
                  >
                    {subscribeLoading ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        Memproses…
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base" style={{fontVariationSettings:"'FILL' 1"}}>subscriptions</span>
                        Berlangganan Sekarang
                      </>
                    )}
                  </button>
                  <div className="text-sm font-semibold text-white/70">
                    Mulai dari <span className="font-extrabold text-white">Rp 150.000</span> / bulan
                  </div>
                </div>
              </div>

              <div className="hidden items-center justify-center bg-white/10 px-10 lg:flex">
                <div className="text-center">
                  <p className="font-heading text-7xl font-extrabold text-white">30×</p>
                  <p className="mt-2 text-sm font-semibold text-white/80">porsi gratis<br />per bulan</p>
                  <div className="mx-auto mt-4 h-px w-16 bg-white/30" />
                  <p className="mt-4 text-sm font-semibold text-white/70">
                    Hemat hingga<br />
                    <span className="text-xl font-extrabold text-white">Rp 1.200.000</span>
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {role === null && (
          <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-rf-primary to-emerald-700 text-white shadow-[0px_20px_60px_rgba(21,128,61,0.20)]">
            <div className="flex flex-col items-center gap-4 p-8 text-center md:flex-row md:justify-between md:text-left">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-white/70">RescueFood Membership</p>
                <h2 className="mt-1 text-2xl font-extrabold">1 porsi gratis setiap hari — mulai Rp 150k/bulan</h2>
                <p className="mt-1 text-sm font-semibold text-white/80">Login untuk mulai berlangganan dan nikmati AI meal assignment otomatis.</p>
              </div>
              <Link
                href="/auth"
                className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-rf-primary shadow-lg hover:bg-rf-surface-container"
              >
                Login & Bergabung
              </Link>
            </div>
          </section>
        )}

        <section id="marketplace" className="space-y-6">
          {isSubscriber && (
            <div className="overflow-hidden rounded-2xl border-2 border-rf-primary/30 bg-gradient-to-r from-rf-primary/8 to-emerald-50">
              <div className="flex items-center justify-between gap-2 border-b border-rf-primary/20 bg-rf-primary/10 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-rf-primary" style={{fontVariationSettings:"'FILL' 1"}}>verified</span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-rf-primary">Member Aktif</span>
                </div>
                <span className="rounded-full bg-rf-primary/15 px-2.5 py-0.5 text-xs font-extrabold text-rf-primary">Rp 150k/bulan</span>
              </div>
              <div className="px-5 py-4">
                {assignState === "idle" && (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-extrabold text-rf-text-onyx">Porsi gratis harianmu siap diklaim!</p>
                      <p className="mt-0.5 text-sm font-semibold text-rf-text-muted">AI akan mencarikan makanan dari merchant terdekat sesuai preferensimu.</p>
                    </div>
                    <button type="button" onClick={claimDailyMeal}
                      className="shrink-0 inline-flex items-center gap-2 rounded-full bg-rf-primary-container px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-rf-primary">
                      <span className="material-symbols-outlined text-base" style={{fontVariationSettings:"'FILL' 1"}}>near_me</span>
                      Cari Porsi Terdekat
                    </button>
                  </div>
                )}
                {(assignState === "locating" || assignState === "assigning") && (
                  <div className="flex items-center gap-3 py-1">
                    <svg className="h-5 w-5 animate-spin text-rf-primary" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    <p className="font-semibold text-rf-text-muted">{assignState === "locating" ? "Mendapatkan lokasimu…" : "AI sedang mencari makanan terdekat…"}</p>
                  </div>
                )}
                {assignState === "done" && assignedMeal && (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined mt-0.5 text-2xl text-rf-primary" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                      <div>
                        <p className="font-extrabold text-rf-primary">Porsi berhasil diamankan!</p>
                        <p className="mt-0.5 text-sm font-bold text-rf-text-onyx">{assignedMeal.title} — {assignedMeal.merchantName}</p>
                        <p className="text-xs font-semibold text-rf-text-muted">{assignedMeal.pickupLocation}</p>
                        <Link href="/profile" className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-rf-primary hover:underline">
                          <span className="material-symbols-outlined text-sm">receipt_long</span>
                          Lihat pickup code di Orders
                        </Link>
                      </div>
                    </div>
                    <button type="button" onClick={() => setAssignState("idle")} className="shrink-0 text-rf-text-muted hover:text-rf-text-onyx">
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                )}
                {assignState === "already" && (
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl text-rf-secondary" style={{fontVariationSettings:"'FILL' 1"}}>event_available</span>
                    <div>
                      <p className="font-extrabold text-rf-text-onyx">Porsi hari ini sudah diamankan.</p>
                      <Link href="/profile" className="text-sm font-semibold text-rf-primary hover:underline">Cek pickup code di halaman Orders →</Link>
                    </div>
                  </div>
                )}
                {assignState === "error" && (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-rf-error" style={{fontVariationSettings:"'FILL' 1"}}>error</span>
                      <p className="text-sm font-semibold text-rf-error">{assignError}</p>
                    </div>
                    <button type="button" onClick={() => setAssignState("idle")} className="shrink-0 text-sm font-extrabold text-rf-error hover:underline">Coba lagi</button>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-heading text-[32px] font-bold leading-10 tracking-[-0.01em] text-rf-text-onyx">
                Pilihan Makanan untukmu
              </h2>
              <p className="mt-1 text-sm text-rf-text-muted">
                {filteredListings.length} listing ditemukan
                {searchQuery && ` untuk "${searchQuery}"`}
              </p>
            </div>
            {(searchQuery || selectedCategory !== "all" || filterType !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setFilterType("all");
                }}
                className="rf-focus-ring flex items-center gap-1 rounded-rf-control px-3 py-2 text-sm font-semibold text-rf-primary hover:bg-rf-surface-container"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                Reset Filter
              </button>
            )}
          </div>

          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredListings.slice(0, 8).map((listing, index) => (
                <FoodCard key={listing.id} listing={listing} image={fallbackImages[index % fallbackImages.length]} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-rf-outline-variant bg-rf-surface-base p-12 text-center">
              <span className="material-symbols-outlined mx-auto block text-6xl text-rf-outline">
                search_off
              </span>
              <h3 className="mt-4 text-xl font-bold text-rf-text-onyx">
                Tidak ada listing yang cocok
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-rf-text-muted">
                Coba ubah kata kunci atau filter untuk melihat opsi surplus makanan lain.
              </p>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="flex flex-col justify-center space-y-8 rounded-[1.5rem] bg-rf-surface-container p-8">
            <ImpactRow icon="restaurant" value={impactSummary.mealsRescued} text="makanan terselamatkan dari tempat pembuangan" />
            <ImpactRow icon="store" value={impactSummary.partnerMerchants} text="merchant aktif bergabung bersama kami" tertiary />
          </section>

          <section className="relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-[1.5rem] border border-rf-outline-variant/30 bg-rf-surface-container-low p-8">
            <div className="z-10 max-w-[60%] space-y-4">
              <p className="font-heading text-xl font-semibold leading-7 text-rf-text-muted">
                Punya surplus makanan?
              </p>
              <h2 className="font-heading text-[32px] font-bold leading-10 tracking-[-0.01em] text-rf-primary">
                Jadi Merchant RescueFood
              </h2>
              <p className="mb-6 text-base leading-6 tracking-[0.01em] text-rf-text-muted">
                Gabung sekarang dan jadi bagian dari gerakan selamatkan makanan.
              </p>
              <Link
                href="/merchant"
                className="rf-focus-ring inline-flex items-center gap-2 rounded-full bg-rf-primary-container px-6 py-3 text-sm font-semibold text-white hover:bg-rf-primary-fixed hover:text-rf-text-onyx"
              >
                Daftar Merchant
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            <span className="material-symbols-outlined pointer-events-none absolute bottom-0 right-0 translate-x-8 translate-y-8 text-[200px] text-rf-primary/20">
              storefront
            </span>
          </section>
        </div>
      </div>

      <footer className="mt-20 border-t border-rf-outline-variant/20 bg-rf-surface-container">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 px-5 py-12 md:flex-row md:px-16">
          <div className="font-heading text-xl font-bold text-rf-text-onyx">
            © 2024 RescueFood. Together for a sustainable future. {impactSummary.co2SavedKg}kg CO2 saved.
          </div>
          <div className="flex flex-wrap gap-6 text-base text-rf-text-muted">
            <a className="underline opacity-80 hover:text-rf-primary hover:opacity-100" href="#">Privacy Policy</a>
            <a className="underline opacity-80 hover:text-rf-primary hover:opacity-100" href="#">Terms of Service</a>
            <a className="underline opacity-80 hover:text-rf-primary hover:opacity-100" href="#">Cookie Settings</a>
            <a className="underline opacity-80 hover:text-rf-primary hover:opacity-100" href="#">Contact Us</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function HeroBadge({
  className,
  icon,
  label,
  value,
}: {
  className: string;
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className={`rf-glass-card absolute flex items-center gap-2 rounded-full px-4 py-2 shadow-md ${className}`}>
      <span className="material-symbols-outlined text-rf-primary">{icon}</span>
      <div>
        <p className="text-xs font-bold leading-4 tracking-[0.05em] text-rf-text-muted">{label}</p>
        <p className="font-heading text-xl font-semibold leading-7 text-rf-primary">{value}</p>
      </div>
    </div>
  );
}

function CategoryPill({ 
  icon, 
  label, 
  color, 
  active = false,
  onClick 
}: { 
  icon: string; 
  label: string; 
  color: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className={`rf-focus-ring flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold shadow-sm transition ${
        active 
          ? "border-rf-primary bg-rf-primary text-white" 
          : "border-rf-outline-variant bg-white hover:border-rf-primary hover:bg-rf-surface-container-high"
      }`}
    >
      <span className={`material-symbols-outlined ${active ? "text-white" : color}`}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function FoodCard({ listing, image }: { listing: FoodListing; image: string }) {
  const displayPrice = listing.currentPrice ?? listing.rescuePrice;
  const discount = `Diskon ${Math.max(0, Math.round((1 - displayPrice / listing.originalPrice) * 100))}%`;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group overflow-hidden rounded-xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(21,128,61,0.08)]"
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          alt={listing.title}
          src={image}
          width={640}
          height={420}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 rounded bg-rf-primary-container px-2 py-1 text-xs font-bold text-white">
          {discount}
        </div>
        <div className="absolute right-3 top-3">
          <FavoriteButton listingId={listing.id} />
        </div>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="truncate font-heading text-xl font-semibold leading-7 text-rf-text-onyx">
          {listing.title}
        </h3>
        <p className="flex items-center gap-1 text-sm text-rf-text-muted">
          <span className="material-symbols-outlined text-xs">storefront</span>
          {listing.merchantName ?? "Merchant"}
        </p>
        {listing.merchantRating !== undefined && listing.merchantRating > 0 && (
          <p className="flex items-center gap-1 text-xs text-rf-text-muted">
            <span className="material-symbols-outlined text-xs text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            {listing.merchantRating.toFixed(1)}
          </p>
        )}
        <p className="flex items-center gap-1 text-xs text-rf-outline">
          <span className="material-symbols-outlined text-xs">schedule</span>
          {listing.pickupWindow}
        </p>
        <div className="flex items-center gap-2 pt-2">
          <span className="font-bold text-rf-primary">
            Rp {displayPrice.toLocaleString("id-ID")}
          </span>
          <span className="text-xs text-rf-outline line-through">
            Rp {listing.originalPrice.toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ImpactRow({
  icon,
  value,
  text,
  tertiary = false,
}: {
  icon: string;
  value: string | number;
  text: string;
  tertiary?: boolean;
}) {
  return (
    <div className="flex items-center gap-6">
      <div className={`flex size-16 items-center justify-center rounded-full text-white ${tertiary ? "bg-rf-tertiary-container" : "bg-rf-primary-container"}`}>
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <div>
        <h3 className={`font-heading text-[32px] font-bold leading-10 tracking-[-0.01em] ${tertiary ? "text-rf-tertiary" : "text-rf-primary"}`}>
          {value}
        </h3>
        <p className="text-base leading-6 tracking-[0.01em] text-rf-text-muted">
          {text}
        </p>
      </div>
    </div>
  );
}
