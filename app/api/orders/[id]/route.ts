import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { notifyOrderConfirmed, notifyOrderReady, notifyOrderCompleted } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Login is required", 401);
  }

  if (currentUser.role !== "MERCHANT" || !currentUser.merchantId) {
    return fail("Only merchants can update orders", 403);
  }

  const { id } = await params;
  const body = await request.json();

  if (
    body.status !== "CONFIRMED" &&
    body.status !== "READY_FOR_PICKUP" &&
    body.status !== "COMPLETED" &&
    body.status !== "CANCELLED"
  ) {
    return fail("Unsupported order status update");
  }

  const existingOrder = await prisma.order.findFirst({
    where: {
      id,
      merchantId: currentUser.merchantId,
    },
  });

  if (!existingOrder) {
    return fail("Order not found", 404);
  }

  const order = await prisma.order.update({
    where: {
      id,
    },
    data: {
      status: body.status,
    },
    include: {
      customer: {
        select: {
          name: true,
        },
      },
      listing: true,
    },
  });

  // Send notification to customer based on status
  if (body.status === "CONFIRMED") {
    await notifyOrderConfirmed(order.id, order.customerId);
  } else if (body.status === "READY_FOR_PICKUP") {
    await notifyOrderReady(order.id, order.customerId);
  } else if (body.status === "COMPLETED") {
    await notifyOrderCompleted(order.id, order.customerId);
  }

  return ok(order);
}
