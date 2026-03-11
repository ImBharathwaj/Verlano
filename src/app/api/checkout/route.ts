import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { CART_COOKIE_NAME } from "@/lib/cart";
import { getRazorpay, getRazorpayKeyId } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

type ShippingInput = {
  shippingName: string;
  shippingPhone: string;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
};

function parseBody(body: unknown): ShippingInput | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  return {
    shippingName: typeof o.shippingName === "string" ? o.shippingName.trim() : "",
    shippingPhone: typeof o.shippingPhone === "string" ? o.shippingPhone.trim() : "",
    shippingStreet: typeof o.shippingStreet === "string" ? o.shippingStreet.trim() : "",
    shippingCity: typeof o.shippingCity === "string" ? o.shippingCity.trim() : "",
    shippingState: typeof o.shippingState === "string" ? o.shippingState.trim() : "",
    shippingPostalCode: typeof o.shippingPostalCode === "string" ? o.shippingPostalCode.trim() : "",
  };
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

  const razorpay = getRazorpay();
  const keyId = getRazorpayKeyId();
  if (!razorpay || !keyId) {
    return NextResponse.json(
      { error: "Payment gateway not configured" },
      { status: 503 },
    );
  }

  try {
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

    let totalAmount = 0;
    for (const item of cart.items) {
      const stock = item.variant.inventory?.stockQuantity ?? 0;
      if (stock < item.quantity) {
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

    const order = await prisma.order.create({
      data: {
        userId: cart.userId,
        totalAmount,
        paymentStatus: "pending",
        orderStatus: "pending",
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

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount,
      currency: "INR",
      receipt: order.id,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
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
