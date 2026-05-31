import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { notifyClaimApproved, notifyClaimRejected } from "@/lib/notifications";
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
    return fail("Only merchants can update donation claims", 403);
  }

  const { id } = await params;
  const body = await request.json();

  if (
    body.status !== "APPROVED" &&
    body.status !== "REJECTED" &&
    body.status !== "COMPLETED" &&
    body.status !== "CANCELLED"
  ) {
    return fail("Unsupported donation claim status update");
  }

  const existingClaim = await prisma.donationClaim.findFirst({
    where: {
      id,
      merchantId: currentUser.merchantId,
    },
  });

  if (!existingClaim) {
    return fail("Donation claim not found", 404);
  }

  const claim = await prisma.donationClaim.update({
    where: {
      id,
    },
    data: {
      status: body.status,
    },
    include: {
      charity: true,
      listing: true,
      merchant: true,
    },
  });

  // Send notification to charity based on status
  const charity = await prisma.charity.findUnique({
    where: { id: claim.charityId },
    select: { userId: true },
  });

  if (charity) {
    if (body.status === "APPROVED") {
      await notifyClaimApproved(claim.id, charity.userId);
    } else if (body.status === "REJECTED") {
      await notifyClaimRejected(claim.id, charity.userId);
    }
  }

  return ok(claim);
}
