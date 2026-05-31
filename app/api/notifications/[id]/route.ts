import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Unauthorized", 401);
  }

  const { id } = await params;
  const body = await request.json();

  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    return fail("Notification not found", 404);
  }

  if (notification.userId !== currentUser.id) {
    return fail("Forbidden", 403);
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: {
      read: body.read ?? notification.read,
    },
  });

  return ok(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Unauthorized", 401);
  }

  const { id } = await params;

  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    return fail("Notification not found", 404);
  }

  if (notification.userId !== currentUser.id) {
    return fail("Forbidden", 403);
  }

  await prisma.notification.delete({
    where: { id },
  });

  return ok({ message: "Notification deleted" });
}
