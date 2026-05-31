import { notFound } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { NewListingForm } from "@/components/new-listing-form";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/route-guards";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const currentUser = await requireRole("MERCHANT");

  if (!currentUser.merchantId) {
    notFound();
  }

  const merchant = await prisma.merchant.findUnique({
    where: {
      id: currentUser.merchantId,
    },
    select: {
      verificationStatus: true,
      address: true,
      latitude: true,
      longitude: true,
    },
  });

  if (!merchant) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-rf-background text-rf-text-onyx">
      <AppHeader
        active="merchant"
        actions={[{ href: "/merchant", label: "Dashboard" }]}
      />

      <section className="mx-auto w-full max-w-[1280px] px-5 py-12 md:px-16 md:py-16">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
              Create listing
            </p>
            <h1 className="mt-2 font-heading text-5xl font-extrabold leading-[56px] tracking-[-0.02em] text-rf-text-onyx">
              Publikasikan surplus makanan
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-7 tracking-[0.01em] text-rf-text-muted">
              Tambahkan detail makanan, safety information, pickup window, dan
              lokasi map sebelum listing tampil di marketplace.
            </p>
          </div>
          <Link
            href="/merchant#all-listings"
            className="rf-focus-ring inline-flex w-fit items-center gap-2 rounded-full border border-rf-primary px-5 py-3 text-sm font-extrabold text-rf-primary transition hover:bg-rf-surface-container-low"
          >
            <span className="material-symbols-outlined text-[18px]">list</span>
            All listings
          </Link>
        </div>

        {merchant.verificationStatus !== "VERIFIED" ? (
          <div className="rounded-rf-card border border-rf-secondary-container/40 bg-rf-secondary-fixed p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
            <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
              Verification required
            </p>
            <h2 className="mt-2 text-2xl font-black text-rf-text-onyx">
              Listing baru terkunci sampai admin approve merchant ini.
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-rf-text-muted">
              Status saat ini: {merchant.verificationStatus.toLowerCase()}.
              Setelah admin approve, halaman ini otomatis bisa dipakai untuk
              membuat listing.
            </p>
            <Link
              href="/merchant"
              className="rf-focus-ring mt-5 inline-flex rounded-rf-control bg-rf-primary px-4 py-3 text-sm font-extrabold text-white"
            >
              Kembali ke dashboard
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <GuideCard icon="restaurant" title="1. Detail makanan" text="Nama, kategori, deskripsi, allergen, dan foto." />
              <GuideCard icon="schedule" title="2. Safety window" text="Pickup window dan batas konsumsi yang jelas." />
              <GuideCard icon="location_on" title="3. Lokasi pickup" text="Lokasi tersimpan dari profile merchant." />
            </div>

            <NewListingForm
              merchantId={currentUser.merchantId}
              merchantLocation={{
                address: merchant.address,
                latitude: merchant.latitude,
                longitude: merchant.longitude,
              }}
            />
          </>
        )}
      </section>
    </main>
  );
}

function GuideCard({
  icon,
  text,
  title,
}: {
  icon: string;
  text: string;
  title: string;
}) {
  return (
    <div className="rounded-xl border border-rf-outline-variant/20 bg-rf-surface-base p-5 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-rf-primary-fixed text-rf-primary">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="font-heading text-xl font-semibold leading-7 text-rf-text-onyx">
        {title}
      </p>
      <p className="mt-1 text-sm font-semibold leading-6 text-rf-text-muted">
        {text}
      </p>
    </div>
  );
}
