import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Unauthorized", 401);
  }

  const result = await prisma.notification.updateMany({
    where: {
      userId: currentUser.id,
      read: false,
    },
    data: {
      read: true,
    },
  });

  return ok({ count: result.count });
}
