import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/admin/listings/[id]
 * Body: { action: "remove" | "activate" }
 * Admin-only: nonaktifkan atau aktifkan kembali listing
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Login diperlukan", 401);
  }

  if (currentUser.role !== "ADMIN") {
    return fail("Hanya admin yang dapat mengubah status listing", 403);
  }

  const { id } = await params;
  const body = await request.json();
  const { action } = body;

  if (action !== "remove" && action !== "activate") {
    return fail("action harus 'remove' atau 'activate'");
  }

  const listing = await prisma.foodListing.findUnique({
    where: { id },
    include: {
      merchant: {
        select: { verificationStatus: true },
      },
    },
  });

  if (!listing) {
    return fail("Listing tidak ditemukan", 404);
  }

  // Hanya listing dari merchant verified yang bisa diaktifkan kembali
  if (
    action === "activate" &&
    listing.merchant.verificationStatus !== "VERIFIED"
  ) {
    return fail(
      "Listing tidak dapat diaktifkan: merchant belum terverifikasi",
      400,
    );
  }

  const newStatus = action === "remove" ? "REMOVED" : "ACTIVE";

  const updatedListing = await prisma.foodListing.update({
    where: { id },
    data: { status: newStatus },
    select: {
      id: true,
      title: true,
      status: true,
      merchantId: true,
    },
  });

  return ok(updatedListing);
}
