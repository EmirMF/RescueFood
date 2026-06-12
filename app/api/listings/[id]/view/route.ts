import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-response";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const listing = await prisma.foodListing.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!listing) return fail("Listing not found", 404);

  const updated = await prisma.foodListing.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
    select: { viewCount: true },
  });

  return ok({ viewCount: updated.viewCount });
}
