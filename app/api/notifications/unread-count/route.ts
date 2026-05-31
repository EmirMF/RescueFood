import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Unauthorized", 401);
  }

  const count = await prisma.notification.count({
    where: {
      userId: currentUser.id,
      read: false,
    },
  });

  return ok({ count });
}
