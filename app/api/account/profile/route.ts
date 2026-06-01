import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/account/profile
 * Body: { name?: string; email?: string }
 * Update nama dan/atau email user yang sedang login.
 */
export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return fail("Login diperlukan", 401);

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : null;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : null;

  if (!name && !email) {
    return fail("Tidak ada data yang diubah", 400);
  }

  // Validasi nama
  if (name !== null) {
    if (name.length < 2) return fail("Nama minimal 2 karakter", 400);
    if (name.length > 100) return fail("Nama maksimal 100 karakter", 400);
    if (!/^[\p{L}\p{M}\s'.,-]+$/u.test(name)) {
      return fail("Nama hanya boleh mengandung huruf, spasi, dan karakter ' . , -", 400);
    }
  }

  // Validasi email
  if (email !== null) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail("Format email tidak valid", 400);
    }

    // Cek apakah email sudah dipakai akun lain
    const existing = await prisma.user.findFirst({
      where: { email, NOT: { id: currentUser.id } },
      select: { id: true },
    });
    if (existing) return fail("Email sudah digunakan akun lain", 409);
  }

  const updated = await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      ...(name !== null && { name }),
      ...(email !== null && { email }),
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return ok(updated);
}
