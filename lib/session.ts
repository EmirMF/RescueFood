import type { UserRole } from "@/lib/types";

export const roleLabels: Record<UserRole, string> = {
  customer: "Customer",
  merchant: "Merchant",
  charity: "Customer",
  admin: "Admin",
};
