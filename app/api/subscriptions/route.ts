import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-response";
import { matchPackageForUser } from "@/lib/subscription-matcher";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return fail("Login is required", 401);

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { subscriptionStatus: true, dietaryPreferences: true },
  });

  return ok(user);
}

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return fail("Login is required", 401);

  const body = await request.json();
  const subscriptionStatus =
    typeof body.subscriptionStatus === "string"
      ? body.subscriptionStatus
      : undefined;
  const dietaryPreferences = Array.isArray(body.dietaryPreferences)
    ? (body.dietaryPreferences as string[]).filter(
        (p) => typeof p === "string",
      )
    : undefined;

  const updated = await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      ...(subscriptionStatus !== undefined && { subscriptionStatus }),
      ...(dietaryPreferences !== undefined && { dietaryPreferences }),
    },
    select: { subscriptionStatus: true, dietaryPreferences: true },
  });

  return ok(updated);
}

export async function POST() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return fail("Login is required", 401);

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { subscriptionStatus: true, dietaryPreferences: true },
  });

  if (user?.subscriptionStatus !== "active") {
    return fail("User does not have an active subscription", 403);
  }

  const packages = await prisma.foodListing.findMany({
    where: { status: "ACTIVE", mode: "SALE" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const matched = matchPackageForUser(
    packages.map((p) => ({ ...p })),
    user.dietaryPreferences,
  );

  if (!matched) {
    return fail("No safe packages available for your dietary preferences", 404);
  }

  return ok({ matchedPackage: matched });
}
