import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { CART_COOKIE_NAME } from "@/lib/cart";
import { getRazorpay, getRazorpayKeyId } from "@/lib/razorpay";
import { getCurrentUser } from "@/lib/customer-auth";
import { addContactToResend } from "@/lib/newsletter";
import { releaseExpiredReservations, getAvailableStock } from "@/lib/inventory-reservation";
import { validateCoupon, incrementCouponUsage } from "@/lib/coupon";
import { sendOrderConfirmationEmail } from "@/lib/order-email";

export const dynamic = "force-dynamic";

type ShippingInput = {
  shippingEmail?: string;
  shippingName: string;
  shippingPhone: string;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  subscribeToNewsletter?: boolean;
  couponCode?: string;
  paymentMethod?: string;
};

function parseBody(body: unknown): ShippingInput | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  return {
    shippingEmail: typeof o.shippingEmail === "string" ? o.shippingEmail.trim() || undefined : undefined,
    shippingName: typeof o.shippingName === "string" ? o.shippingName.trim() : "",
    shippingPhone: typeof o.shippingPhone === "string" ? o.shippingPhone.trim() : "",
    shippingStreet: typeof o.shippingStreet === "string" ? o.shippingStreet.trim() : "",
    shippingCity: typeof o.shippingCity === "string" ? o.shippingCity.trim() : "",
    shippingState: typeof o.shippingState === "string" ? o.shippingState.trim() : "",
    shippingPostalCode: typeof o.shippingPostalCode === "string" ? o.shippingPostalCode.trim() : "",
    subscribeToNewsletter: o.subscribeToNewsletter === true,
    couponCode: typeof o.couponCode === "string" ? o.couponCode.trim() || undefined : undefined,
    paymentMethod: typeof o.paymentMethod === "string" ? o.paymentMethod.trim() : "razorpay",
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidShipping(s: ShippingInput): boolean {
  return !!(
    s.shippingName &&
    s.shippingPhone &&
    s.shippingStreet &&
    s.shippingCity &&
    s.shippingState &&
    s.shippingPostalCode
  );
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value ?? null;

  if (!cartId) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const body = parseBody(await request.json().catch(() => null));
  if (!body || !isValidShipping(body)) {
    return NextResponse.json(
      { error: "Valid shipping address required (name, phone, street, city, state, postalCode)" },
      { status: 400 },
    );
  }

  const isCod = body.paymentMethod === "cod";

  if (!isCod) {
    const razorpay = getRazorpay();
    const keyId = getRazorpayKeyId();
    if (!razorpay || !keyId) {
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 503 },
      );
    }
  }

  try {
    let currentUser: { id: string; email?: string } | null = null;
    try {
      currentUser = await getCurrentUser(request);
    } catch {
      // Auth not configured or invalid session; proceed as guest
    }
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true, inventory: true },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    await releaseExpiredReservations();

    let totalAmount = 0;
    for (const item of cart.items) {
      const inv = item.variant.inventory;
      const stockQty = inv?.stockQuantity ?? 0;
      const reservedQty = inv?.reservedQuantity ?? 0;
      const available = getAvailableStock(stockQty, reservedQty);
      if (available < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.variant.product.title} (${item.variant.size})` },
          { status: 400 },
        );
      }
      totalAmount += item.variant.price * item.quantity;
    }

    if (totalAmount <= 0) {
      return NextResponse.json({ error: "Invalid cart total" }, { status: 400 });
    }

    let discountAmount = 0;
    let couponCode: string | undefined;
    if (body.couponCode) {
      const couponResult = await validateCoupon(body.couponCode, totalAmount);
      if (!couponResult.valid) {
        return NextResponse.json({ error: couponResult.error }, { status: 400 });
      }
      discountAmount = couponResult.discountAmount;
      couponCode = couponResult.couponCode;
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);

    const order = await prisma.order.create({
      data: {
        userId: currentUser?.id ?? cart.userId,
        cartId,
        totalAmount: finalAmount,
        couponCode: couponCode ?? undefined,
        discountAmount,
        paymentStatus: isCod ? "cod" : "pending",
        orderStatus: isCod ? "processing" : "pending",
        shippingEmail: body.shippingEmail,
        shippingName: body.shippingName,
        shippingPhone: body.shippingPhone,
        shippingStreet: body.shippingStreet,
        shippingCity: body.shippingCity,
        shippingState: body.shippingState,
        shippingPostalCode: body.shippingPostalCode,
        items: {
          create: cart.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.variant.price,
          })),
        },
      },
    });

    if (isCod) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.create({
          data: {
            orderId: order.id,
            paymentProvider: "cod",
            paymentStatus: "cod",
            transactionId: `cod-${order.id}`,
            amount: finalAmount,
          },
        });
        for (const item of cart.items) {
          await tx.inventory.updateMany({
            where: { variantId: item.variantId },
            data: { stockQuantity: { decrement: item.quantity } },
          });
        }
      });
      if (couponCode) {
        await incrementCouponUsage(couponCode);
      }
      if (order.cartId) {
        const { releaseCartReservations } = await import("@/lib/inventory-reservation");
        await releaseCartReservations(order.cartId);
      }
      const cookieStore = await cookies();
      cookieStore.delete(CART_COOKIE_NAME);
      sendOrderConfirmationEmail(order.id).catch((err) =>
        console.error("[checkout cod] order email", err)
      );
      return NextResponse.json({ orderId: order.id, cod: true });
    }

    const razorpay = getRazorpay();
    const keyId = getRazorpayKeyId();
    const razorpayOrder = await razorpay!.orders.create({
      amount: finalAmount,
      currency: "INR",
      receipt: order.id,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    if (body.subscribeToNewsletter) {
      const email = (body.shippingEmail ?? currentUser?.email ?? "").trim().toLowerCase();
      if (email && isValidEmail(email)) {
        prisma.newsletterSubscriber
          .upsert({
            where: { email },
            create: { email, source: "checkout" },
            update: { source: "checkout" },
          })
          .then(() => addContactToResend(email))
          .catch((err) => console.error("[checkout newsletter]", err));
      }
    }

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: finalAmount,
      currency: "INR",
      key: keyId,
    });
  } catch (error) {
    console.error("[POST /api/checkout]", error);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 },
    );
  }
}
