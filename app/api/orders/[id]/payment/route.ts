import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { createSnapTransaction } from "@/lib/midtrans";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "CUSTOMER") {
    return fail("Only customers can create payment", 403);
  }

  const { id } = await params;

  // Get order details
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

  if (!order) {
    return fail("Order not found", 404);
  }

  if (order.customerId !== currentUser.id) {
    return fail("Unauthorized", 403);
  }

  if (order.paymentStatus === "PAID") {
    return fail("Order already paid", 400);
  }

  // Create Midtrans order ID
  const midtransOrderId = `ORDER-${order.id}-${Date.now()}`;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    `${request.headers.get("x-forwarded-proto") ?? "http"}://${request.headers.get("host")}`;

  try {
    // Create Snap transaction
    const snapResponse = await createSnapTransaction({
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: order.totalPrice,
      },
      item_details: [
        {
          id: order.listing.id,
          price: order.listing.discountedPrice,
          quantity: order.quantity,
          name: order.listing.title,
        },
        ...(order.adminFee > 0
          ? [
              {
                id: "admin-fee",
                price: order.adminFee,
                quantity: 1,
                name: "Biaya Admin",
              },
            ]
          : []),
      ],
      customer_details: {
        first_name: order.customer.name,
        email: order.customer.email,
      },
      enabled_payments: [
        "gopay",
        "shopeepay",
        "other_qris",
        "bca_va",
        "bni_va",
        "bri_va",
        "permata_va",
      ],
      callbacks: {
        finish: `${appUrl}/payment/${order.id}?gateway=finish`,
        error: `${appUrl}/payment/${order.id}?gateway=error`,
      },
    });

    // Update order with payment token
    await prisma.order.update({
      where: { id: id },
      data: {
        midtransToken: snapResponse.token,
        midtransOrderId: midtransOrderId,
      },
    });

    return ok({
      token: snapResponse.token,
      redirectUrl: snapResponse.redirect_url,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Midtrans error:", error);
    return fail(
      error instanceof Error ? error.message : "Failed to create payment"
    );
  }
}
