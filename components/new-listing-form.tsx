"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { secureFetch } from "@/lib/secure-fetch";
import type { FoodCategory, ListingType } from "@/lib/types";

type ListingFormInitialValues = {
  id?: string;
  title: string;
  category: FoodCategory;
  description: string;
  listingType: ListingType;
  originalPrice: number;
  rescuePrice: number;
  floorPrice?: number;
  quantity: number;
  pickupStartTime: string | Date;
  pickupEndTime: string | Date;
  consumeBefore: string | Date;
  imageUrl: string;
  impactKgCo2: number;
  pickupLocation?: string;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  allergenInfo?: string | null;
  allergenTags?: string[];
};

export function NewListingForm({
  initialValues,
  merchantLocation,
  merchantId,
  mode = "create",
}: {
  initialValues?: ListingFormInitialValues;
  merchantLocation?: {
    address: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  merchantId?: string;
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [category, setCategory] = useState<FoodCategory>(
    initialValues?.category ?? "bakery",
  );
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [originalPrice, setOriginalPrice] = useState(
    String(initialValues?.originalPrice ?? 85000),
  );
  const [rescuePrice, setRescuePrice] = useState(
    String(initialValues?.rescuePrice ?? 42000),
  );
  const [floorPrice, setFloorPrice] = useState(
    String(initialValues?.floorPrice ?? 20000),
  );
  const [quantity, setQuantity] = useState(String(initialValues?.quantity ?? 8));
  const [pickupLocation] = useState(
    initialValues?.pickupLocation ??
      merchantLocation?.address ??
      "Set lokasi merchant di profile terlebih dahulu",
  );
  const [pickupLatitude] = useState(
    initialValues?.pickupLatitude ?? merchantLocation?.latitude ?? null,
  );
  const [pickupLongitude] = useState(
    initialValues?.pickupLongitude ?? merchantLocation?.longitude ?? null,
  );
  const [allergenInfo, setAllergenInfo] = useState(
    initialValues?.allergenInfo ?? "",
  );
  const [allergenTags, setAllergenTags] = useState<string[]>(
    initialValues?.allergenTags ?? [],
  );
  const [pickupStartTime, setPickupStartTime] = useState(
    initialValues?.pickupStartTime
      ? toDateTimeLocal(initialValues.pickupStartTime)
      : getDefaultDateTime(2),
  );
  const [pickupEndTime, setPickupEndTime] = useState(
    initialValues?.pickupEndTime
      ? toDateTimeLocal(initialValues.pickupEndTime)
      : getDefaultDateTime(4),
  );
  const [consumeBefore, setConsumeBefore] = useState(
    initialValues?.consumeBefore
      ? toDateTimeLocal(initialValues.consumeBefore)
      : getDefaultDateTime(18),
  );
  const [imageUrl, setImageUrl] = useState(
    initialValues?.imageUrl ??
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadImage(file: File) {
    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await secureFetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result.data?.url) {
        setError(result.error ?? "Gagal upload gambar.");
        return;
      }

      setImageUrl(result.data.url);
    } catch {
      setError("Gagal terhubung ke API upload.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSave() {
    setError("");

    if (!merchantId) {
      setError("Merchant seed belum tersedia. Jalankan pnpm db:seed dulu.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await secureFetch(
        mode === "edit" && initialValues?.id
          ? `/api/listings/${initialValues.id}`
          : "/api/listings",
        {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchantId,
          title: title || "Listing surplus baru",
          description:
            description ||
            "Listing surplus dari dashboard merchant. Detail listing dibuat dari flow backend lokal.",
          category,
          mode: "SALE",
          originalPrice: Number(originalPrice) || 0,
          discountedPrice: Number(rescuePrice) || 0,
          floorPrice: Number(floorPrice) || 0,
          quantity: Number(quantity) || 1,
          pickupLocation: pickupLocation.trim() || "Bandung",
          pickupLatitude,
          pickupLongitude,
          pickupStartTime: new Date(pickupStartTime).toISOString(),
          pickupEndTime: new Date(pickupEndTime).toISOString(),
          consumeBefore: new Date(consumeBefore).toISOString(),
          allergenInfo: allergenInfo.trim() || null,
          allergenTags,
          imageUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.data) {
        setError(result.error ?? "Gagal menyimpan listing.");
        return;
      }
    } catch {
      setError("Gagal terhubung ke API listing.");
      return;
    } finally {
      setIsSaving(false);
    }

    router.push("/merchant");
  }

  const mapQuery = encodeURIComponent(
    pickupLatitude !== null && pickupLongitude !== null
      ? `${pickupLatitude},${pickupLongitude}`
      : pickupLocation || "Bandung",
  );
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&output=embed`;
  const mapOpenUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <form className="grid gap-6 rounded-xl border border-rf-outline-variant/20 bg-rf-surface-base p-6 shadow-[0px_20px_40px_rgba(21,128,61,0.08)] md:p-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-5">
          <div className="border-b border-rf-outline-variant/20 pb-4">
            <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
              Food details
            </p>
            <h2 className="mt-1 font-heading text-[32px] font-bold leading-10 tracking-[-0.01em] text-rf-text-onyx">
              Detail surplus
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nama makanan" value={title} onChange={setTitle} />
            <label className="grid gap-2">
              <span className="text-sm font-extrabold text-rf-text-onyx">
                Kategori
              </span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as FoodCategory)}
                className="rf-focus-ring h-12 rounded-rf-control border border-rf-outline-variant bg-rf-surface-container-low px-4 text-sm font-semibold outline-none focus:border-rf-primary"
              >
                <option value="bakery">Bakery</option>
                <option value="rice_meal">Rice meal</option>
                <option value="produce">Produce</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="snack">Snack</option>
                <option value="beverage">Minuman</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-extrabold text-rf-text-onyx">
              Deskripsi
            </span>
            <textarea
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Jelaskan kondisi, isi paket, dan catatan penyimpanan."
              className="rf-focus-ring rounded-rf-control border border-rf-outline-variant bg-rf-surface-container-low px-4 py-3 text-sm font-semibold outline-none focus:border-rf-primary"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-extrabold text-rf-text-onyx">
              Allergen info (free text)
            </span>
            <textarea
              rows={2}
              value={allergenInfo}
              onChange={(event) => setAllergenInfo(event.target.value)}
              placeholder="Contoh: Mengandung gluten, telur, susu."
              className="rf-focus-ring rounded-rf-control border border-rf-outline-variant bg-rf-surface-container-low px-4 py-3 text-sm font-semibold outline-none focus:border-rf-primary"
            />
          </label>

          <fieldset className="grid gap-2">
            <legend className="text-sm font-extrabold text-rf-text-onyx">
              Allergen tags
            </legend>
            <div className="flex flex-wrap gap-3">
              {["Gluten", "Dairy", "Egg", "Soy", "Peanut", "Seafood", "Halal", "Vegan"].map((tag) => (
                <label key={tag} className="flex cursor-pointer items-center gap-2 rounded-full border border-rf-outline-variant px-3 py-1.5 text-sm font-semibold has-[:checked]:border-rf-primary has-[:checked]:bg-rf-primary/10">
                  <input
                    type="checkbox"
                    className="accent-rf-primary"
                    checked={allergenTags.includes(tag)}
                    onChange={(e) =>
                      setAllergenTags((prev) =>
                        e.target.checked
                          ? [...prev, tag]
                          : prev.filter((t) => t !== tag),
                      )
                    }
                  />
                  {tag}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Harga normal" value={originalPrice} onChange={setOriginalPrice} />
            <Field label="Harga rescue (awal)" value={rescuePrice} onChange={setRescuePrice} />
            <Field label="Floor price" value={floorPrice} onChange={setFloorPrice} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Stok" value={quantity} onChange={setQuantity} />
          </div>
        </div>

        <aside className="grid gap-4 rounded-xl bg-rf-surface-container-low p-5">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
              Listing preview
            </p>
            <h3 className="mt-1 font-heading text-xl font-semibold leading-7 text-rf-text-onyx">
              {title || "Nama makanan"}
            </h3>
          </div>
          <div className="overflow-hidden rounded-lg bg-rf-surface-container">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={title || "Preview listing"}
              src={imageUrl}
              className="h-48 w-full object-cover"
            />
          </div>
          <div className="grid gap-3 text-sm font-semibold text-rf-text-muted">
            <span className="flex items-center justify-between gap-3">
              <span>Harga rescue</span>
              <strong className="text-rf-primary">
                Rp {(Number(rescuePrice) || 0).toLocaleString("id-ID")}
              </strong>
            </span>
            <span className="flex items-center justify-between gap-3">
              <span>Stok</span>
              <strong className="text-rf-text-onyx">{Number(quantity) || 0} item</strong>
            </span>
            <span className="flex items-center justify-between gap-3">
              <span>CO2 impact</span>
              <strong className="text-rf-text-onyx">AI estimated</strong>
            </span>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="grid min-w-0 gap-6">
          <div className="border-b border-rf-outline-variant/20 pb-4">
            <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
              Pickup & safety
            </p>
            <h2 className="mt-1 font-heading text-[32px] font-bold leading-10 tracking-[-0.01em] text-rf-text-onyx">
              Lokasi dan waktu pickup
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-rf-text-muted">
              Lokasi pickup diambil dari profile merchant agar setiap listing
              memakai alamat dan pinpoint yang konsisten.
            </p>
          </div>

          <div className="rounded-xl border border-rf-outline-variant/30 bg-rf-surface-container-low p-5">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-extrabold text-rf-text-onyx">
                  <span className="material-symbols-outlined text-[18px] text-rf-primary">
                    location_on
                  </span>
                  Saved merchant pickup location
                </span>
                <div className="rounded-rf-control border border-rf-outline-variant bg-rf-surface-base px-4 py-3">
                  <p className="text-sm font-extrabold leading-6 text-rf-text-onyx">
                    {pickupLocation}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-rf-text-muted">
                    {pickupLatitude !== null && pickupLongitude !== null
                      ? `${pickupLatitude.toFixed(6)}, ${pickupLongitude.toFixed(6)}`
                      : "Pinpoint belum diset di profile merchant."}
                  </p>
                </div>
                <p className="text-xs font-semibold leading-5 text-rf-text-muted">
                  Ubah alamat dan pinpoint dari halaman Profile merchant.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-rf-outline-variant/30 bg-rf-surface-container-low p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-rf-primary">
                schedule
              </span>
              <h3 className="font-heading text-xl font-semibold leading-7 text-rf-text-onyx">
                Pickup window
              </h3>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field
                label="Pickup mulai"
                type="datetime-local"
                value={pickupStartTime}
                onChange={setPickupStartTime}
              />
              <Field
                label="Pickup selesai"
                type="datetime-local"
                value={pickupEndTime}
                onChange={setPickupEndTime}
              />
              <div className="lg:col-span-2">
                <Field
                  label="Konsumsi sebelum"
                  type="datetime-local"
                  value={consumeBefore}
                  onChange={setConsumeBefore}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-extrabold text-rf-text-onyx">
                Foto listing
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    uploadImage(file);
                  }
                }}
                className="rf-focus-ring h-12 rounded-rf-control border border-rf-outline-variant bg-rf-surface-container-low px-4 py-2 text-sm font-semibold outline-none file:mr-3 file:rounded-rf-control file:border-0 file:bg-rf-primary file:px-3 file:py-1.5 file:text-xs file:font-extrabold file:text-white focus:border-rf-primary"
              />
              <span className="truncate text-xs font-semibold text-rf-text-muted">
                {isUploading ? "Mengupload..." : imageUrl}
              </span>
            </label>
          </div>
        </div>

        <aside className="h-fit overflow-hidden rounded-xl border border-rf-outline-variant/30 bg-rf-surface-base shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
          <div className="border-b border-rf-outline-variant/20 p-5">
            <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
              Map preview
            </p>
            <h3 className="mt-1 font-heading text-xl font-semibold leading-7 text-rf-text-onyx">
              Customer pickup point
            </h3>
          </div>
          <iframe
            title="Pickup location map"
            src={mapEmbedUrl}
            className="h-72 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="p-4">
            <p className="break-words text-sm font-extrabold leading-6 text-rf-text-onyx">
              {pickupLocation || "Bandung"}
            </p>
            <p className="mt-1 text-xs font-semibold leading-5 text-rf-text-muted">
              Preview memakai saved pinpoint merchant jika tersedia; jika belum,
              Google Maps memakai teks alamat.
            </p>
            <a
              href={mapOpenUrl}
              target="_blank"
              rel="noreferrer"
              className="rf-focus-ring mt-3 inline-flex items-center gap-2 rounded-full border border-rf-primary px-4 py-2 text-sm font-extrabold text-rf-primary"
            >
              <span className="material-symbols-outlined text-[18px]">map</span>
              Buka di Google Maps
            </a>
          </div>
        </aside>
      </section>
      {error && (
        <p className="rounded-rf-control bg-rf-error-container px-4 py-3 text-sm font-extrabold text-rf-error">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/merchant")}
          className="rf-focus-ring rounded-rf-control border border-rf-outline-variant px-5 py-3 text-center text-sm font-extrabold text-rf-primary"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isUploading}
          className="rf-focus-ring rounded-rf-control bg-rf-primary-container px-5 py-3 text-sm font-extrabold text-white"
        >
          {isSaving
            ? "Menyimpan..."
            : mode === "edit"
              ? "Update listing"
              : "Simpan listing"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-rf-text-onyx">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rf-focus-ring h-12 rounded-rf-control border border-rf-outline-variant bg-rf-surface-container-low px-4 text-sm font-semibold outline-none focus:border-rf-primary"
      />
    </label>
  );
}

function getDefaultDateTime(hoursFromNow: number) {
  const date = new Date();
  date.setHours(date.getHours() + hoursFromNow, 0, 0, 0);
  return date.toISOString().slice(0, 16);
}

function toDateTimeLocal(value: string | Date) {
  const date = new Date(value);
  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}
