import { prisma } from "@/lib/prisma";

type NotificationType =
  | "ORDER_CONFIRMED"
  | "ORDER_READY"
  | "ORDER_COMPLETED"
  | "ORDER_CANCELLED"
  | "CLAIM_APPROVED"
  | "CLAIM_REJECTED"
  | "CLAIM_COMPLETED"
  | "LISTING_SOLD_OUT"
  | "LISTING_EXPIRING"
  | "MERCHANT_VERIFIED"
  | "CHARITY_VERIFIED"
  | "NEW_ORDER"
  | "NEW_CLAIM";

type CreateNotificationParams = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
};

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        actionUrl: params.actionUrl,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

export async function notifyOrderConfirmed(orderId: string, customerId: string) {
  return createNotification({
    userId: customerId,
    type: "ORDER_CONFIRMED",
    title: "Pesanan Dikonfirmasi",
    message: "Merchant telah mengkonfirmasi pesanan Anda. Siapkan untuk pickup!",
    actionUrl: `/orders/${orderId}`,
    metadata: { orderId },
  });
}

export async function notifyOrderReady(orderId: string, customerId: string) {
  return createNotification({
    userId: customerId,
    type: "ORDER_READY",
    title: "Pesanan Siap Diambil",
    message: "Pesanan Anda sudah siap untuk pickup. Jangan lupa bawa kode pickup!",
    actionUrl: `/orders/${orderId}`,
    metadata: { orderId },
  });
}

export async function notifyOrderCompleted(orderId: string, customerId: string) {
  return createNotification({
    userId: customerId,
    type: "ORDER_COMPLETED",
    title: "Pesanan Selesai",
    message: "Terima kasih telah menggunakan RescueFood! Jangan lupa beri review.",
    actionUrl: `/orders/${orderId}`,
    metadata: { orderId },
  });
}

export async function notifyNewOrder(orderId: string, merchantUserId: string, listingTitle: string) {
  return createNotification({
    userId: merchantUserId,
    type: "NEW_ORDER",
    title: "Pesanan Baru",
    message: `Anda mendapat pesanan baru untuk "${listingTitle}"`,
    actionUrl: `/merchant/orders/${orderId}`,
    metadata: { orderId },
  });
}

export async function notifyClaimApproved(claimId: string, charityUserId: string) {
  return createNotification({
    userId: charityUserId,
    type: "CLAIM_APPROVED",
    title: "Klaim Donasi Disetujui",
    message: "Merchant telah menyetujui klaim donasi Anda. Siapkan untuk pickup!",
    actionUrl: `/charity`,
    metadata: { claimId },
  });
}

export async function notifyClaimRejected(claimId: string, charityUserId: string) {
  return createNotification({
    userId: charityUserId,
    type: "CLAIM_REJECTED",
    title: "Klaim Donasi Ditolak",
    message: "Maaf, merchant menolak klaim donasi Anda.",
    actionUrl: `/charity`,
    metadata: { claimId },
  });
}

export async function notifyNewClaim(claimId: string, merchantUserId: string, listingTitle: string) {
  return createNotification({
    userId: merchantUserId,
    type: "NEW_CLAIM",
    title: "Klaim Donasi Baru",
    message: `Charity mengajukan klaim untuk "${listingTitle}"`,
    actionUrl: `/merchant`,
    metadata: { claimId },
  });
}

export async function notifyMerchantVerified(merchantUserId: string) {
  return createNotification({
    userId: merchantUserId,
    type: "MERCHANT_VERIFIED",
    title: "Akun Terverifikasi",
    message: "Selamat! Akun merchant Anda telah diverifikasi. Mulai buat listing sekarang!",
    actionUrl: `/merchant/listings/new`,
  });
}

export async function notifyCharityVerified(charityUserId: string) {
  return createNotification({
    userId: charityUserId,
    type: "CHARITY_VERIFIED",
    title: "Akun Terverifikasi",
    message: "Selamat! Akun charity Anda telah diverifikasi. Mulai klaim donasi sekarang!",
    actionUrl: `/charity`,
  });
}
