import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { verifySignature, mapMidtransStatus } from "@/lib/midtrans";
import { buildPaymentUpdateData } from "@/lib/payment-status";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key,
      payment_type,
    } = body;

    // Verify signature
    const isValid = verifySignature(
      order_id,
      status_code,
      gross_amount,
      signature_key
    );

    if (!isValid) {
      console.error("Invalid signature from Midtrans");
      return fail("Invalid signature", 403);
    }

    // Find order by midtransOrderId
    const order = await prisma.order.findUnique({
      where: { midtransOrderId: order_id },
    });

    if (!order) {
      console.error("Order not found:", order_id);
      return fail("Order not found", 404);
    }

    // Map Midtrans status to our payment status
    const paymentStatus = mapMidtransStatus(transaction_status, fraud_status);

    await prisma.order.update({
      where: { id: order.id },
      data: buildPaymentUpdateData({
        orderStatus: order.status,
        paymentMethod: payment_type,
        paymentStatus,
      }),
    });

    console.log(
      `Payment notification processed for order ${order.id}: ${paymentStatus}`
    );

    return ok({ message: "Notification processed" });
  } catch (error) {
    console.error("Webhook error:", error);
    return fail("Webhook processing failed", 500);
  }
}
