import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { PickupCodeCard } from "@/components/pickup-code-card";
import { ChatSection } from "@/components/chat-section";
import { OrderReviewSection } from "@/components/order-review-section";
import { getCurrentUser } from "@/lib/auth";
import { mapApiListingToFoodListing } from "@/lib/listing-mapper";
import { mapApiOrderToRescueOrder } from "@/lib/order-mapper";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth");
  }

  const { id } = await params;
  const dbOrder = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      customer: {
        select: {
          name: true,
        },
      },
      listing: {
        include: {
          merchant: true,
        },
      },
    },
  });

  if (!dbOrder || dbOrder.customerId !== currentUser.id) {
    notFound();
  }

  if (dbOrder.paymentStatus !== "PAID") {
    redirect(`/payment/${dbOrder.id}?status=unpaid`);
  }

  const order = mapApiOrderToRescueOrder(dbOrder);
  const listing = mapApiListingToFoodListing(dbOrder.listing);

  return (
    <main className="min-h-screen bg-background">
      <AppHeader actions={[{ href: "/profile", label: "Profil" }]} showSession />

      <section className="mx-auto grid max-w-5xl gap-6 px-5 py-8 md:grid-cols-[1fr_360px] md:px-8 md:py-12">
        <div className="rounded-rf-card bg-rf-surface-base p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
            Pickup order
          </p>
          <h1 className="mt-2 text-4xl font-black leading-tight text-rf-text-onyx">
            {listing.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-rf-text-muted">
            Tunjukkan QR ini ke merchant saat mengambil order. Jika kamera
            scanner belum tersedia, merchant dapat mencocokkan kode pickup
            secara manual.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Info label="Status" value={order.status.replaceAll("_", " ")} />
            <Info label="Quantity" value={`${order.quantity} item`} />
            <Info label="Merchant" value={listing.merchantName ?? "-"} />
            <Info label="Pickup" value={listing.pickupWindow} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <aside className="h-fit rounded-rf-card bg-rf-surface-base p-6 shadow-[0px_20px_40px_rgba(21,128,61,0.08)]">
            <PickupCodeCard code={order.pickupCode} />
            <p className="mt-4 text-center text-xs font-semibold leading-5 text-rf-text-muted">
              Jangan bagikan kode ini sebelum kamu berada di lokasi pickup.
            </p>
          </aside>

          <ChatSection orderId={order.id} currentUserId={currentUser.id} />

          <OrderReviewSection
            orderId={order.id}
            orderStatus={order.status}
            merchantName={listing.merchantName ?? "Merchant"}
            currentUserId={currentUser.id}
          />
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-rf-control bg-rf-surface-container-low p-4">
      <p className="text-xs font-extrabold uppercase tracking-wider text-rf-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-extrabold capitalize text-rf-text-onyx">
        {value}
      </p>
    </div>
  );
}
