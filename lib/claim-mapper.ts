import type { ClaimStatus, DonationClaim } from "@/lib/types";

type ApiDonationClaim = {
  id: string;
  listingId: string;
  quantity: number;
  pickupCode: string;
  status: string;
  createdAt: string | Date;
  charity?: {
    organizationName: string;
  };
};

function mapClaimStatus(status: string): ClaimStatus {
  if (status === "APPROVED") {
    return "approved";
  }

  if (status === "REJECTED") {
    return "rejected";
  }

  if (status === "COMPLETED") {
    return "completed";
  }

  if (status === "CANCELLED") {
    return "cancelled";
  }

  return "pending";
}

export function mapApiClaimToDonationClaim(
  claim: ApiDonationClaim,
): DonationClaim {
  return {
    id: claim.id,
    listingId: claim.listingId,
    organizationName:
      claim.charity?.organizationName ?? "Komunitas Berbagi Bandung",
    pickupCode: claim.pickupCode,
    quantity: claim.quantity,
    status: mapClaimStatus(claim.status),
    createdAt:
      claim.createdAt instanceof Date
        ? claim.createdAt.toISOString()
        : claim.createdAt,
  };
}
