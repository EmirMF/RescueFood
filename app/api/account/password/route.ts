import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { validatePassword } from "@/lib/password-validation";

/**
 * PATCH /api/account/password
 * Body: { currentPassword: string; newPassword: string; confirmPassword: string }
 * Ganti password user yang sedang login.
 * OAuth users (passwordHash = "") harus set password baru tanpa currentPassword.
 */
export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return fail("Login diperlukan", 401);

  const body = await request.json();
  const { currentPassword, newPassword, confirmPassword } = body as {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };

  if (!newPassword) return fail("Password baru wajib diisi", 400);
  if (!confirmPassword) return fail("Konfirmasi password wajib diisi", 400);
  if (newPassword !== confirmPassword) return fail("Konfirmasi password tidak cocok", 400);

  // Validasi kekuatan password baru
  const validation = validatePassword(newPassword);
  if (!validation.valid) return fail(validation.errors.join(", "), 400);

  // Ambil passwordHash dari DB
  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { passwordHash: true },
  });
  if (!user) return fail("User tidak ditemukan", 404);

  const isOAuthUser = !user.passwordHash;

  if (isOAuthUser) {
    // OAuth user: tidak perlu currentPassword, langsung set password baru
  } else {
    // Regular user: wajib verifikasi password lama dulu
    if (!currentPassword) {
      return fail("Password saat ini wajib diisi", 400);
    }
    const isCorrect = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCorrect) {
      return fail("Password saat ini salah", 401);
    }
    // Cegah re-use password lama
    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) {
      return fail("Password baru tidak boleh sama dengan password saat ini", 400);
    }
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: currentUser.id },
    data: { passwordHash: newHash },
  });

  return ok({ updated: true });
}