import type { RescueOrder } from "@/lib/types";

type ApiOrder = {
  id: string;
  listingId: string;
  quantity: number;
  adminFee?: number;
  totalPrice?: number;
  status: string;
  pickupCode: string;
  paymentStatus?: string;
  paymentMethod?: string | null;
  paidAt?: string | Date | null;
  createdAt: string | Date;
  customer?: {
    name: string;
  };
  [key: string]: unknown; // Allow additional fields from Prisma
};

export function mapApiOrderToRescueOrder(order: ApiOrder): RescueOrder {
  return {
    id: order.id,
    listingId: order.listingId,
    customerName: order.customer?.name ?? "Customer",
    quantity: order.quantity,
    adminFee: order.adminFee ?? 0,
    totalPrice: order.totalPrice ?? 0,
    status:
      order.status === "CONFIRMED"
        ? "confirmed"
        : order.status === "READY_FOR_PICKUP"
          ? "ready_for_pickup"
          : order.status === "COMPLETED"
            ? "completed"
            : order.status === "CANCELLED" || order.status === "EXPIRED"
              ? "cancelled"
              : "pending",
    pickupCode: order.pickupCode,
    paymentStatus: (order.paymentStatus || "PENDING") as "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED",
    paymentMethod: order.paymentMethod || undefined,
    paidAt: order.paidAt 
      ? (order.paidAt instanceof Date ? order.paidAt.toISOString() : order.paidAt)
      : undefined,
    createdAt:
      order.createdAt instanceof Date
        ? order.createdAt.toISOString()
        : order.createdAt,
  };
}
