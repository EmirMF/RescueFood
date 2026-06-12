import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-response";
import { createSnapTransaction, getMidtransConfig } from "@/lib/midtrans";

const DEMO_MODE = process.env.PAYMENT_DEMO_MODE === "true";

const SUBSCRIPTION_PRICE = 150_000;

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return fail("Login is required", 401);
  if (currentUser.role !== "CUSTOMER") return fail("Only customers can subscribe", 403);

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { subscriptionStatus: true, name: true, email: true },
  });

  if (user?.subscriptionStatus === "active") {
    return fail("Already subscribed", 400);
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (() => {
      const proto = request.headers.get("x-forwarded-proto") ?? "http";
      const host = request.headers.get("host") ?? "localhost:3000";
      return `${proto}://${host}`;
    })();

  const midtransOrderId = `SUB-${currentUser.id}-${Date.now()}`;

  try {
    const snapResponse = await createSnapTransaction({
      transaction_details: { order_id: midtransOrderId, gross_amount: SUBSCRIPTION_PRICE },
      item_details: [
        { id: "membership-monthly", price: SUBSCRIPTION_PRICE, quantity: 1, name: "RescueFood Membership — 1 bulan" },
      ],
      customer_details: { first_name: user?.name ?? currentUser.name, email: user?.email ?? currentUser.email },
      enabled_payments: ["gopay", "shopeepay", "other_qris", "bca_va", "bni_va", "bri_va"],
      callbacks: {
        finish: `${appUrl}/subscriptions/onboarding?payment=finish`,
        error:  `${appUrl}/subscriptions/onboarding?payment=error`,
      },
    });

    const paymentStatus = DEMO_MODE ? "PAID" : "PENDING";

    await prisma.subscriptionPayment.create({
      data: {
        userId: currentUser.id,
        midtransOrderId,
        midtransToken: snapResponse.token,
        amount: SUBSCRIPTION_PRICE,
        status: paymentStatus,
        paidAt: DEMO_MODE ? new Date() : null,
      },
    });

    if (DEMO_MODE) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: { subscriptionStatus: "active" },
      });
    }

    return ok({
      token: snapResponse.token,
      redirectUrl: snapResponse.redirect_url,
      midtransConfig: getMidtransConfig(),
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to create payment");
  }
}
