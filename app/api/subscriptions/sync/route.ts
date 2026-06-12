import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-response";
import { getTransactionStatus, mapMidtransStatus } from "@/lib/midtrans";

export async function POST() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return fail("Login is required", 401);

  const latest = await prisma.subscriptionPayment.findFirst({
    where: { userId: currentUser.id },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) return fail("No subscription payment found", 404);

  if (latest.status === "PAID") {
    return ok({ status: "active", alreadyActive: true });
  }

  try {
    const midtransStatus = await getTransactionStatus(latest.midtransOrderId);
    const paymentStatus = mapMidtransStatus(
      midtransStatus.transaction_status,
      midtransStatus.fraud_status,
    );

    const isPaid = paymentStatus === "paid";

    await prisma.subscriptionPayment.update({
      where: { id: latest.id },
      data: {
        status: isPaid ? "PAID" : paymentStatus.toUpperCase(),
        paymentMethod: midtransStatus.payment_type ?? null,
        paidAt: isPaid ? new Date() : null,
      },
    });

    if (isPaid) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: { subscriptionStatus: "active" },
      });
    }

    return ok({ status: isPaid ? "active" : paymentStatus });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Failed to sync payment status",
      502,
    );
  }
}
