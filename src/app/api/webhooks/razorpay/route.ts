import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/order-email";
import { releaseCartReservations } from "@/lib/inventory-reservation";

export const dynamic = "force-dynamic";

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  return expected === signature;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (WEBHOOK_SECRET && !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { event: string; payload?: { payment?: { entity?: { id: string; order_id: string } } } };
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.event === "payment.captured") {
    const paymentId = payload.payload?.payment?.entity?.id;
    const razorpayOrderId = payload.payload?.payment?.entity?.order_id;
    if (!paymentId || !razorpayOrderId) {
      return NextResponse.json({ received: true });
    }

    try {
      const order = await prisma.order.findUnique({
        where: { razorpayOrderId },
        include: { payment: true, items: true },
      });
      if (!order || order.paymentStatus === "paid") {
        return NextResponse.json({ received: true });
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.upsert({
          where: { orderId: order.id },
          create: {
            orderId: order.id,
            paymentProvider: "razorpay",
            paymentStatus: "success",
            transactionId: paymentId,
            amount: order.totalAmount,
          },
          update: {
            paymentStatus: "success",
            transactionId: paymentId,
          },
        });
        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: "paid", orderStatus: "processing" },
        });
        for (const item of order.items) {
          await tx.inventory.updateMany({
            where: { variantId: item.variantId },
            data: { stockQuantity: { decrement: item.quantity } },
          });
        }
      });
      if (order.cartId) {
        await releaseCartReservations(order.cartId);
      }
      sendOrderConfirmationEmail(order.id).catch((err) =>
        console.error("[webhook razorpay] order email", err)
      );
    } catch (error) {
      console.error("[webhook razorpay payment.captured]", error);
      return NextResponse.json(
        { error: "Webhook processing failed" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
