import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return fail("Unauthorized", 401);
  }

  const { id } = await params;

  const wishlist = await prisma.wishlist.findUnique({
    where: { id },
  });

  if (!wishlist) {
    return fail("Wishlist item not found", 404);
  }

  if (wishlist.userId !== currentUser.id) {
    return fail("Forbidden", 403);
  }

  await prisma.wishlist.delete({
    where: { id },
  });

  return ok({ message: "Removed from wishlist" });
}
