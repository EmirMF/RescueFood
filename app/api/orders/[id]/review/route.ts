import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/orders/[id]/review - Submit review untuk order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: orderId } = await params;
    const body = await request.json();
    const { rating, comment } = body;

    // Validasi rating
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Validasi comment (optional tapi jika ada harus string)
    if (comment !== undefined && comment !== null && typeof comment !== "string") {
      return NextResponse.json(
        { error: "Comment must be a string" },
        { status: 400 }
      );
    }

    // Verifikasi order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        customerId: true,
        merchantId: true,
        status: true,
        review: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Cek apakah user adalah customer dari order ini
    if (order.customerId !== currentUser.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Cek apakah order sudah completed
    if (order.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Can only review completed orders" },
        { status: 400 }
      );
    }

    // Cek apakah sudah ada review
    if (order.review) {
      return NextResponse.json(
        { error: "Order already reviewed" },
        { status: 400 }
      );
    }

    // Buat review dan update average rating merchant dalam transaction
    const result = await prisma.$transaction(async (tx) => {
      // Buat review
      const review = await tx.review.create({
        data: {
          orderId,
          customerId: currentUser.id,
          merchantId: order.merchantId,
          rating,
          comment: comment?.trim() || null,
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Hitung ulang average rating merchant
      const reviews = await tx.review.findMany({
        where: { merchantId: order.merchantId },
        select: { rating: true },
      });

      const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      // Update merchant average rating
      await tx.merchant.update({
        where: { id: order.merchantId },
        data: { averageRating },
      });

      return review;
    });

    return NextResponse.json({
      data: result,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/orders/[id]/review - Ambil review untuk order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: orderId } = await params;

    // Verifikasi akses ke order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        customerId: true,
        merchantId: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Cek apakah user adalah customer atau merchant dari order ini
    const isCustomer = order.customerId === currentUser.id;
    const isMerchant = currentUser.merchantId && order.merchantId === currentUser.merchantId;

    if (!isCustomer && !isMerchant) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Ambil review
    const review = await prisma.review.findUnique({
      where: { orderId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: review,
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
