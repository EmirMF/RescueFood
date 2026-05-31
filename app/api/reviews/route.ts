import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/reviews - Ambil semua review dari user yang sedang login
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Ambil semua review dari user
    const reviews = await prisma.review.findMany({
      where: { customerId: currentUser.id },
      include: {
        order: {
          select: {
            id: true,
            listing: {
              select: {
                title: true,
                merchant: {
                  select: {
                    businessName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: reviews.map((review) => ({
        ...review,
        order: {
          ...review.order,
          listing: {
            title: review.order.listing.title,
            merchantName: review.order.listing.merchant.businessName,
          },
        },
      })),
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
