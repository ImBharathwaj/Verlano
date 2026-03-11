import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay-verify";
import { CART_COOKIE_NAME } from "@/lib/cart";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id: orderId } = await params;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "razorpay_order_id, razorpay_payment_id, razorpay_signature required" },
      { status: 400 },
    );
  }

  const razorpayOrderId = (body as Record<string, unknown>).razorpay_order_id;
  const razorpayPaymentId = (body as Record<string, unknown>).razorpay_payment_id;
  const razorpaySignature = (body as Record<string, unknown>).razorpay_signature;

  if (
    typeof razorpayOrderId !== "string" ||
    typeof razorpayPaymentId !== "string" ||
    typeof razorpaySignature !== "string"
  ) {
    return NextResponse.json(
      { error: "razorpay_order_id, razorpay_payment_id, razorpay_signature required" },
      { status: 400 },
    );
  }

  if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({ success: true, orderId: order.id });
    }

    if (order.payment?.transactionId === razorpayPaymentId) {
      return NextResponse.json({ success: true, orderId: order.id });
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          paymentProvider: "razorpay",
          paymentStatus: "success",
          transactionId: razorpayPaymentId,
          amount: order.totalAmount,
        },
        update: {
          paymentStatus: "success",
          transactionId: razorpayPaymentId,
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: "paid", orderStatus: "processing" },
      });

      for (const item of order.items) {
        await tx.inventory.updateMany({
          where: { variantId: item.variantId },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });
      }
    });

    const cookieStore = await cookies();
    cookieStore.delete(CART_COOKIE_NAME);

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("[POST /api/orders/[id]/verify-payment]", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 },
    );
  }
}
