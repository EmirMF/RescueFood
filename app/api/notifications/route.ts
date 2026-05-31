import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unreadOnly") === "true";
  const limit = parseInt(searchParams.get("limit") || "20");

  const notifications = await prisma.notification.findMany({
    where: {
      userId: currentUser.id,
      ...(unreadOnly ? { read: false } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return ok(notifications);
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Unauthorized", 401);
  }

  const body = await request.json();
  const { type, title, message, actionUrl, metadata } = body;

  if (!type || !title || !message) {
    return fail("type, title, and message are required");
  }

  const notification = await prisma.notification.create({
    data: {
      userId: currentUser.id,
      type,
      title,
      message,
      actionUrl,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  return ok(notification, { status: 201 });
}
