import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { getAdminFee, setAdminFee } from "@/lib/settings";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return fail("Only admins can read admin fee", 403);
  }

  return ok({
    adminFee: await getAdminFee(),
  });
}

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return fail("Only admins can update admin fee", 403);
  }

  const body = await request.json();
  const adminFee = Number(body.adminFee);

  if (!Number.isFinite(adminFee) || adminFee < 0) {
    return fail("adminFee must be a non-negative number");
  }

  await setAdminFee(adminFee);

  return ok({
    adminFee: Math.round(adminFee),
  });
}
