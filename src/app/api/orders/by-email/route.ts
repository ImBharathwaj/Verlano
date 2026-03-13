import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId")?.trim();
  const email = searchParams.get("email")?.trim()?.toLowerCase();

  if (!orderId || !email) {
    return NextResponse.json(
      { error: "orderId and email are required" },
      { status: 400 },
    );
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const emailMatches =
      order.userId && order.user
        ? order.user.email?.toLowerCase() === email
        : (order.shippingEmail?.toLowerCase() ?? "") === email;

    if (!emailMatches) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: order.id,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      trackingId: order.trackingId,
      trackingUrl: order.trackingUrl,
      shippingStatus: order.shippingStatus,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("[GET /api/orders/by-email]", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}
