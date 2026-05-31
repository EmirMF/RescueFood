import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { notifyMerchantVerified } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

function toVerificationStatus(status: unknown) {
  if (status === "approved") {
    return "VERIFIED";
  }

  if (status === "rejected") {
    return "REJECTED";
  }

  return null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Login is required", 401);
  }

  if (currentUser.role !== "ADMIN") {
    return fail("Only admins can update verification status", 403);
  }

  const { id, type } = await params;
  const body = await request.json();
  const verificationStatus = toVerificationStatus(body.status);

  if (!verificationStatus) {
    return fail("status must be approved or rejected");
  }

  if (type === "merchant") {
    const merchant = await prisma.$transaction(async (tx) => {
      const updatedMerchant = await tx.merchant.update({
        where: {
          id,
        },
        data: {
          verificationStatus,
        },
        include: {
          user: {
            select: {
              id: true,
            },
          },
        },
      });

      if (verificationStatus === "REJECTED") {
        await tx.foodListing.updateMany({
          where: {
            merchantId: id,
            status: {
              in: ["ACTIVE", "DRAFT"],
            },
          },
          data: {
            status: "REMOVED",
          },
        });
      }

      return updatedMerchant;
    });

    if (verificationStatus === "VERIFIED") {
      await notifyMerchantVerified(merchant.user.id);
    }

    return ok(merchant);
  }

  return fail("type must be merchant");
}
