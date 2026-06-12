"use client";

import { useState, useEffect } from "react";
import { secureFetch } from "@/lib/secure-fetch";

const DIETARY_OPTIONS = [
  { value: "Halal",       icon: "✓", desc: "Tidak mengandung babi atau alkohol" },
  { value: "Vegan",       icon: "🌱", desc: "Tanpa produk hewani" },
  { value: "Vegetarian",  icon: "🥦", desc: "Tanpa daging, boleh susu/telur" },
  { value: "Peanut-Free", icon: "🚫", desc: "Bebas kacang tanah" },
  { value: "Gluten-Free", icon: "🌾", desc: "Bebas gluten/gandum" },
  { value: "Dairy-Free",  icon: "🥛", desc: "Bebas susu dan produk turunannya" },
  { value: "No Seafood",  icon: "🦐", desc: "Tanpa seafood dan shellfish" },
  { value: "No Egg",      icon: "🥚", desc: "Bebas telur" },
];

export function SubscriptionOnboarding({ paymentStatus }: { paymentStatus: string }) {
  const [step, setStep] = useState(paymentStatus === "error" ? -1 : 1);
  const [syncState, setSyncState] = useState<"syncing" | "active" | "pending" | "failed">(
    paymentStatus === "finish" ? "syncing" : paymentStatus === "pending" ? "pending" : "failed",
  );
  const [prefs, setPrefs] = useState<string[]>([]);
  const [locationState, setLocationState] = useState<"idle" | "loading" | "done" | "denied">("idle");
  const [saving, setSaving] = useState(false);

  const isPending = syncState === "pending";

  useEffect(() => {
    if (paymentStatus !== "finish") return;
    secureFetch("/api/subscriptions/sync", { method: "POST" })
      .then(r => r.json())
      .then(result => {
        const status = result.data?.status;
        if (status === "active") setSyncState("active");
        else if (status === "pending") setSyncState("pending");
        else setSyncState("failed");
      })
      .catch(() => setSyncState("failed"));
  }, [paymentStatus]);

  function togglePref(val: string) {
    setPrefs((prev) => prev.includes(val) ? prev.filter((p) => p !== val) : [...prev, val]);
  }

  async function savePrefsAndContinue() {
    setSaving(true);
    await secureFetch("/api/subscriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dietaryPreferences: prefs }),
    }).catch(() => {});
    setSaving(false);
    setStep(3);
  }

  function requestLocation() {
    if (!navigator.geolocation) { setLocationState("denied"); return; }
    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await secureFetch("/api/account/location", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        }).catch(() => {});
        setLocationState("done");
      },
      () => setLocationState("denied"),
      { timeout: 8000 },
    );
  }

  if (step === -1) {
    return (
      <div className="rounded-2xl border border-rf-error/30 bg-rf-error-container/20 p-10 text-center">
        <span className="material-symbols-outlined text-5xl text-rf-error" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
        <h2 className="mt-4 text-2xl font-extrabold text-rf-text-onyx">Pembayaran gagal</h2>
        <p className="mt-2 text-rf-text-muted">Transaksi tidak berhasil diproses. Silakan coba lagi.</p>
        <button type="button" onClick={() => { window.location.href = "/marketplace"; }}
          className="mt-6 rounded-full bg-rf-primary-container px-6 py-3 text-sm font-extrabold text-white hover:bg-rf-primary">
          Kembali ke Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div className="flex items-center justify-center gap-0">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`flex size-9 items-center justify-center rounded-full text-sm font-extrabold transition ${
              step > s ? "bg-rf-primary text-white" : step === s ? "bg-rf-primary-container text-white" : "bg-rf-surface-container-low text-rf-text-muted"
            }`}>
              {step > s
                ? <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                : s}
            </div>
            {s < 3 && (
              <div className={`h-0.5 w-16 transition sm:w-24 ${step > s ? "bg-rf-primary" : "bg-rf-outline-variant/30"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Welcome */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-rf-primary to-emerald-700 p-8 text-white">
            {syncState === "syncing" ? (
              <div className="flex items-center gap-4">
                <svg className="h-10 w-10 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <div>
                  <h1 className="font-heading text-2xl font-extrabold">Mengkonfirmasi pembayaran…</h1>
                  <p className="mt-1 text-sm text-white/80">Sedang memverifikasi status transaksi ke Midtrans.</p>
                </div>
              </div>
            ) : syncState === "failed" ? (
              <>
                <span className="material-symbols-outlined text-4xl text-white/70" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <h1 className="mt-3 font-heading text-2xl font-extrabold">Pembayaran belum terkonfirmasi</h1>
                <p className="mt-2 text-sm text-white/80">
                  Transaksi mungkin masih diproses. Jika sudah bayar, coba refresh halaman ini dalam beberapa menit atau hubungi support.
                </p>
                <button type="button" onClick={() => {
                  setSyncState("syncing");
                  secureFetch("/api/subscriptions/sync", { method: "POST" })
                    .then(r => r.json())
                    .then(result => {
                      const s = result.data?.status;
                      setSyncState(s === "active" ? "active" : s === "pending" ? "pending" : "failed");
                    })
                    .catch(() => setSyncState("failed"));
                }} className="mt-4 rounded-full bg-white/20 px-5 py-2 text-sm font-extrabold hover:bg-white/30">
                  Cek ulang status
                </button>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <h1 className="mt-4 font-heading text-3xl font-extrabold">
                  {isPending ? "Pembayaran sedang diproses!" : "Selamat datang, Member!"}
                </h1>
                <p className="mt-2 text-base font-semibold text-white/85">
                  {isPending
                    ? "Pembayaranmu sedang dikonfirmasi. Lanjutkan setup sambil menunggu."
                    : "Pembayaran berhasil! Kamu punya akses 1 porsi gratis setiap hari. Mari selesaikan setup singkat."}
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { icon: "lunch_dining", label: "30× porsi/bulan" },
                    { icon: "smart_toy",    label: "AI auto-assign" },
                    { icon: "near_me",      label: "Merchant terdekat" },
                  ].map(({ icon, label }) => (
                    <div key={label} className="rounded-xl bg-white/15 p-3 text-center">
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                      <p className="mt-1 text-xs font-semibold">{label}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={syncState === "syncing"}
            className="w-full rounded-full bg-rf-primary-container py-4 text-base font-extrabold text-white hover:bg-rf-primary disabled:opacity-50 disabled:cursor-not-allowed">
            {syncState === "syncing" ? "Menunggu konfirmasi…" : "Mulai Setup →"}
          </button>
        </div>
      )}

      {/* Step 2 — Dietary preferences */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-heading text-2xl font-extrabold text-rf-text-onyx">Preferensi diet & alergi</h2>
            <p className="mt-1 text-rf-text-muted">
              AI kami akan otomatis menghindari makanan yang tidak sesuai. Pilih semua yang berlaku.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {DIETARY_OPTIONS.map(({ value, icon, desc }) => {
              const selected = prefs.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => togglePref(value)}
                  className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition ${
                    selected ? "border-rf-primary bg-rf-primary/8" : "border-rf-outline-variant/30 bg-rf-surface-base hover:border-rf-primary/40"
                  }`}
                >
                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-full text-base ${selected ? "bg-rf-primary text-white" : "bg-rf-surface-container text-rf-text-muted"}`}>
                    {selected ? <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check</span> : icon}
                  </div>
                  <div>
                    <p className={`font-extrabold ${selected ? "text-rf-primary" : "text-rf-text-onyx"}`}>{value}</p>
                    <p className="text-xs font-semibold text-rf-text-muted">{desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {prefs.length === 0 && (
            <p className="rounded-xl bg-rf-surface-container-low px-4 py-3 text-sm font-semibold text-rf-text-muted">
              Tidak ada pantangan? Bagus — AI akan pilihkan makanan terbaik dari merchant terdekat.
            </p>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)}
              className="flex-1 rounded-full border border-rf-outline-variant py-4 text-sm font-extrabold text-rf-text-muted hover:border-rf-text-onyx hover:text-rf-text-onyx">
              ← Kembali
            </button>
            <button type="button" onClick={savePrefsAndContinue} disabled={saving}
              className="flex-[3] rounded-full bg-rf-primary-container py-4 text-base font-extrabold text-white hover:bg-rf-primary disabled:opacity-60">
              {saving ? "Menyimpan…" : "Simpan & Lanjut →"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Location */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-heading text-2xl font-extrabold text-rf-text-onyx">Aktifkan lokasi</h2>
            <p className="mt-1 text-rf-text-muted">
              AI butuh lokasimu untuk mencarikan merchant terdekat dalam radius 5km.
            </p>
          </div>

          <div className="rounded-2xl border border-rf-outline-variant/30 bg-rf-surface-base p-6 text-center">
            {locationState === "idle" && (
              <>
                <span className="material-symbols-outlined text-5xl text-rf-primary" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                <p className="mt-3 font-extrabold text-rf-text-onyx">Izinkan akses lokasi</p>
                <p className="mt-1 text-sm text-rf-text-muted">Lokasi hanya dipakai untuk mencari makanan rescue terdekat.</p>
                <button type="button" onClick={requestLocation}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-rf-primary-container px-6 py-3 text-sm font-extrabold text-white hover:bg-rf-primary">
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>near_me</span>
                  Aktifkan Lokasi
                </button>
              </>
            )}
            {locationState === "loading" && (
              <>
                <svg className="mx-auto h-12 w-12 animate-spin text-rf-primary" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <p className="mt-3 font-semibold text-rf-text-muted">Mendapatkan lokasi…</p>
              </>
            )}
            {locationState === "done" && (
              <>
                <span className="material-symbols-outlined text-5xl text-rf-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <p className="mt-3 font-extrabold text-rf-primary">Lokasi tersimpan!</p>
                <p className="mt-1 text-sm text-rf-text-muted">AI siap mencarikan makanan terdekat untukmu.</p>
              </>
            )}
            {locationState === "denied" && (
              <>
                <span className="material-symbols-outlined text-5xl text-rf-text-muted">location_off</span>
                <p className="mt-3 font-extrabold text-rf-text-onyx">Izin lokasi ditolak</p>
                <p className="mt-1 text-sm text-rf-text-muted">Kamu bisa mengaktifkannya nanti dari halaman Profile, atau set lokasi secara manual.</p>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)}
              className="flex-1 rounded-full border border-rf-outline-variant py-4 text-sm font-extrabold text-rf-text-muted hover:border-rf-text-onyx">
              ← Kembali
            </button>
            <button type="button" onClick={() => { window.location.href = "/marketplace"; }}
              className="flex-[3] rounded-full bg-rf-primary-container py-4 text-base font-extrabold text-white hover:bg-rf-primary">
              {locationState === "done" ? "Selesai & Mulai Rescue 🎉" : "Lewati, Setel Nanti →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
