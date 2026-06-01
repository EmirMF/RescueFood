import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { PaymentCheckout } from "@/components/payment-checkout";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/route-guards";
import { getMidtransConfig } from "@/lib/midtrans";

export const dynamic = "force-dynamic";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentUser = await requireRole("CUSTOMER");

  const order = await prisma.order.findUnique({
    where: { id: id },
    include: {
      listing: {
        include: {
          merchant: true,
        },
      },
      customer: true,
    },
  });

  if (!order || order.customerId !== currentUser.id) {
    notFound();
  }

  // If already paid, redirect to order detail
  if (order.paymentStatus === "PAID") {
    redirect(`/orders/${id}`);
  }

  const midtransConfig = getMidtransConfig();

  return (
    <main className="min-h-screen bg-surface">
      <AppHeader showSession />
      <Suspense fallback={null}>
        <PaymentCheckout
          order={{
            id: order.id,
            totalPrice: order.totalPrice,
            adminFee: order.adminFee,
            quantity: order.quantity,
            listing: {
              title: order.listing.title,
              imageUrl: order.listing.imageUrl,
              merchantName: order.listing.merchant.businessName,
            },
            paymentStatus: order.paymentStatus,
            midtransToken: order.midtransToken,
          }}
          midtransConfig={midtransConfig}
        />
      </Suspense>
    </main>
  );
}
