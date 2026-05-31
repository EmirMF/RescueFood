import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function buildPaymentUpdateData({
  orderStatus,
  paymentMethod,
  paymentStatus,
}: {
  orderStatus: OrderStatus;
  paymentMethod?: string;
  paymentStatus: "pending" | "paid" | "failed" | "expired";
}) {
  const data: {
    paymentStatus: PaymentStatus;
    paymentMethod?: string;
    paidAt?: Date;
    status?: OrderStatus;
  } = {
    paymentStatus: paymentStatus.toUpperCase() as PaymentStatus,
  };

  if (paymentMethod) {
    data.paymentMethod = paymentMethod;
  }

  if (paymentStatus === "paid") {
    data.paidAt = new Date();

    if (orderStatus === "PENDING") {
      data.status = "CONFIRMED";
    }
  }

  return data;
}

export async function updateOrderPaymentStatus({
  orderId,
  paymentMethod,
  paymentStatus,
}: {
  orderId: string;
  paymentMethod?: string;
  paymentStatus: "pending" | "paid" | "failed" | "expired";
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return null;
  }

  return prisma.order.update({
    where: { id: order.id },
    data: buildPaymentUpdateData({
      orderStatus: order.status,
      paymentMethod,
      paymentStatus,
    }),
  });
}
