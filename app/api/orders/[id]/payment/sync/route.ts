import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { getTransactionStatus, mapMidtransStatus } from "@/lib/midtrans";
import { updateOrderPaymentStatus } from "@/lib/payment-status";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "CUSTOMER") {
    return fail("Only customers can sync payment", 403);
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    return fail("Order not found", 404);
  }

  if (order.customerId !== currentUser.id) {
    return fail("Unauthorized", 403);
  }

  if (!order.midtransOrderId) {
    return fail("Payment has not been initialized", 400);
  }

  try {
    const midtransStatus = await getTransactionStatus(order.midtransOrderId);
    const paymentStatus = mapMidtransStatus(
      midtransStatus.transaction_status,
      midtransStatus.fraud_status,
    );
    const updatedOrder = await updateOrderPaymentStatus({
      orderId: order.id,
      paymentMethod: midtransStatus.payment_type,
      paymentStatus,
    });

    if (!updatedOrder) {
      return fail("Order not found", 404);
    }

    return ok({
      id: updatedOrder.id,
      orderStatus: updatedOrder.status,
      paymentMethod: updatedOrder.paymentMethod,
      paymentStatus: updatedOrder.paymentStatus,
    });
  } catch (error) {
    console.error("Payment sync error:", error);
    return fail(
      error instanceof Error ? error.message : "Failed to sync payment status",
      502,
    );
  }
}
