import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/admin/users/[id]
 * Body: { action: "suspend" | "activate" }
 * Admin-only: suspend atau aktifkan akun user
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
    return fail("Hanya admin yang dapat mengubah status akun", 403);
  }

  const { id } = await params;
  const body = await request.json();
  const { action } = body;

  if (action !== "suspend" && action !== "activate") {
    return fail("action harus 'suspend' atau 'activate'");
  }

  // Cegah admin suspend dirinya sendiri
  if (id === currentUser.id) {
    return fail("Admin tidak dapat menonaktifkan akunnya sendiri", 400);
  }

  // Cegah suspend admin lain
  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, role: true, status: true },
  });

  if (!targetUser) {
    return fail("User tidak ditemukan", 404);
  }

  if (targetUser.role === "ADMIN") {
    return fail("Admin tidak dapat menonaktifkan akun admin lain", 400);
  }

  const newStatus = action === "suspend" ? "SUSPENDED" : "ACTIVE";

  const updatedUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id },
      data: { status: newStatus },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    // Jika suspend merchant: nonaktifkan semua listing aktifnya
    if (action === "suspend" && targetUser.role === "MERCHANT") {
      const merchant = await tx.merchant.findUnique({
        where: { userId: id },
        select: { id: true },
      });
      if (merchant) {
        await tx.foodListing.updateMany({
          where: {
            merchantId: merchant.id,
            status: { in: ["ACTIVE", "DRAFT"] },
          },
          data: { status: "REMOVED" },
        });
      }
    }

    return user;
  });

  return ok(updatedUser);
}
