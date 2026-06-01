import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { AdminFeeSettings } from "@/components/admin-fee-settings";
import { AdminVerificationDashboard } from "@/components/admin-verification-dashboard";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/route-guards";
import { getAdminFee } from "@/lib/settings";

export const dynamic = "force-dynamic";

function mapStatus(status: string) {
  if (status === "VERIFIED") {
    return "approved" as const;
  }

  if (status === "REJECTED") {
    return "rejected" as const;
  }

  return "pending" as const;
}

export default async function AdminVerificationPage() {
  await requireRole("ADMIN");

  const [adminFee, merchants] = await Promise.all([
    getAdminFee(),
    prisma.merchant.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);
  const queue = merchants.map((merchant) => ({
    id: merchant.id,
    name: merchant.businessName,
    type: "merchant" as const,
    location: merchant.address,
    submittedAt: merchant.createdAt.toISOString(),
    notes: "Business profile tersedia di database.",
    status: mapStatus(merchant.verificationStatus),
  }));

  const pendingCount = queue.filter((q) => q.status === "pending").length;

  return (
    <main className="min-h-screen bg-background">
      <AppHeader
        active="admin"
        actions={[{ href: "/profile", label: "Profil" }]}
        showSession
      />

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-rf-text-muted">
          <Link href="/admin/dashboard" className="flex items-center gap-1 hover:text-rf-primary transition-colors">
            <span className="material-symbols-outlined text-base">dashboard</span>
            Dashboard
          </Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="font-semibold text-rf-text-onyx">Verifikasi Merchant</span>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="rf-kicker">Admin Verification</p>
            <h1 className="mt-2 font-heading text-3xl font-extrabold leading-tight text-rf-text-onyx md:text-4xl">
              Jaga Trust Platform
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-rf-text-muted">
              Setujui atau tolak merchant sebelum listing dipublikasikan di
              marketplace. Proteksi session admin aktif.
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-3">
              <span
                className="material-symbols-outlined text-amber-600"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                pending_actions
              </span>
              <div>
                <p className="text-sm font-extrabold text-amber-700">
                  {pendingCount} Menunggu Review
                </p>
                <p className="text-xs text-amber-600">Perlu tindakan segera</p>
              </div>
            </div>
          )}
        </div>

        <AdminFeeSettings initialAdminFee={adminFee} />
        <AdminVerificationDashboard initialQueue={queue} />
      </section>
    </main>
  );
}
