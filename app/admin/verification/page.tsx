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

  return (
    <main className="min-h-screen bg-background">
      <AppHeader active="admin" actions={[{ href: "/profile", label: "Profil" }]} />

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <div className="mb-8">
          <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
            Admin verification
          </p>
          <h1 className="mt-2 text-4xl font-black leading-tight text-rf-text-onyx">
            Jaga trust sebelum listing dipublikasikan.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-rf-text-muted">
            Admin dapat menyetujui atau menolak merchant secara langsung ke
            database dengan proteksi session admin.
          </p>
        </div>

        <AdminFeeSettings initialAdminFee={adminFee} />
        <AdminVerificationDashboard initialQueue={queue} />
      </section>
    </main>
  );
}
