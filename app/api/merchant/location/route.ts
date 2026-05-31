import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

function toCoordinate(value: unknown, min: number, max: number) {
  const coordinate = Number(value);

  if (!Number.isFinite(coordinate) || coordinate < min || coordinate > max) {
    return null;
  }

  return coordinate;
}

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Login is required", 401);
  }

  if (currentUser.role !== "MERCHANT" || !currentUser.merchantId) {
    return fail("Only merchants can update merchant location", 403);
  }

  const body = await request.json();
  const address = String(body.address ?? "").trim();
  const latitude = toCoordinate(body.latitude, -90, 90);
  const longitude = toCoordinate(body.longitude, -180, 180);

  if (!address) {
    return fail("address is required");
  }

  if (latitude === null || longitude === null) {
    return fail("Valid latitude and longitude are required");
  }

  const merchant = await prisma.merchant.update({
    where: {
      id: currentUser.merchantId,
    },
    data: {
      address,
      latitude,
      longitude,
    },
  });

  return ok(merchant);
}
