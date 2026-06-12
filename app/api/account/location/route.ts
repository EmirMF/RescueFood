import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-response";

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return fail("Login is required", 401);

  const body = await request.json();
  const lat = typeof body.latitude === "number" ? body.latitude : null;
  const lng = typeof body.longitude === "number" ? body.longitude : null;

  if (lat === null || lng === null) return fail("latitude and longitude required", 400);
  if (lat < -90 || lat > 90) return fail("latitude out of range", 400);
  if (lng < -180 || lng > 180) return fail("longitude out of range", 400);

  await prisma.user.update({
    where: { id: currentUser.id },
    data: { latitude: lat, longitude: lng },
  });

  return ok({ latitude: lat, longitude: lng });
}
