import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { MerchantOrderDetail } from "@/components/merchant-order-detail";
import { mapApiListingToFoodListing } from "@/lib/listing-mapper";
import { mapApiOrderToRescueOrder } from "@/lib/order-mapper";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/route-guards";

export const dynamic = "force-dynamic";

export default async function MerchantOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentUser = await requireRole("MERCHANT");
  const dbOrder = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
      listing: {
        include: {
          merchant: true,
        },
      },
    },
  });

  if (
    !dbOrder ||
    dbOrder.merchantId !== currentUser.merchantId ||
    dbOrder.paymentStatus !== "PAID"
  ) {
    notFound();
  }

  const order = mapApiOrderToRescueOrder(dbOrder);
  const listing = mapApiListingToFoodListing(dbOrder.listing);

  return (
    <main className="min-h-screen bg-surface">
      <AppHeader active="merchant" showSession />
      <MerchantOrderDetail order={order} listing={listing} customerEmail={dbOrder.customer.email} />
    </main>
  );
}
