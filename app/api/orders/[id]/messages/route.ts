import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/orders/[id]/messages - Mengambil semua pesan untuk order tertentu
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

    // Ambil semua pesan untuk order ini
    const messages = await prisma.message.findMany({
      where: { orderId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/orders/[id]/messages - Mengirim pesan baru
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
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

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

    // Buat pesan baru
    const message = await prisma.message.create({
      data: {
        orderId,
        senderId: currentUser.id,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: message,
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
