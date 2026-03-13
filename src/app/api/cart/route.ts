import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/customer-auth";
import { CART_COOKIE_NAME } from "@/lib/cart";
import {
  releaseExpiredReservations,
  reserveStock,
  releaseReservation,
  getAvailableStock,
} from "@/lib/inventory-reservation";

export const dynamic = "force-dynamic";

/** Prefer logged-in user's cart so the same cart is used across devices. */
async function resolveCartId(cookieCartId: string | null, request: Request): Promise<string | null> {
  const user = await getCurrentUser(request);
  if (user) {
    const userCart = await prisma.cart.findFirst({ where: { userId: user.id } });
    if (userCart) return userCart.id;
  }
  return cookieCartId;
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const hadCookie = !!cookieStore.get(CART_COOKIE_NAME)?.value;
  let cartId = cookieStore.get(CART_COOKIE_NAME)?.value ?? null;
  cartId = await resolveCartId(cartId, request);

  if (!cartId) {
    return NextResponse.json({ cart: null, items: [], total: 0 });
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
                inventory: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ cart: null, items: [] });
    }

    const items = cart.items.map((item) => ({
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.variant.price,
      size: item.variant.size,
      color: item.variant.color ?? null,
      productTitle: item.variant.product.title,
      productSlug: item.variant.product.slug,
      productBrand: item.variant.product.brand,
    }));

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const res = NextResponse.json({
      cart: { id: cart.id },
      items,
      total,
    });
    if (cart.userId) {
      res.cookies.set(CART_COOKIE_NAME, cart.id, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return res;
  } catch (error) {
    console.error("[GET /api/cart]", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  let cartId = cookieStore.get(CART_COOKIE_NAME)?.value ?? null;
  cartId = await resolveCartId(cartId, request);

  const body = await request.json().catch(() => ({}));
  const { variantId, quantity = 1 } = body as { variantId?: string; quantity?: number };

  if (!variantId || typeof quantity !== "number" || quantity < 1) {
    return NextResponse.json(
      { error: "variantId and quantity (>= 1) required" },
      { status: 400 },
    );
  }

  try {
    await releaseExpiredReservations();

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { inventory: true },
    });
    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    if (!cartId) {
      const user = await getCurrentUser(request);
      if (user) {
        let userCart = await prisma.cart.findFirst({ where: { userId: user.id } });
        if (!userCart) userCart = await prisma.cart.create({ data: { userId: user.id } });
        cartId = userCart.id;
      } else {
        const newCart = await prisma.cart.create({ data: {} });
        cartId = newCart.id;
      }
    }

    const existing = await prisma.cartItem.findFirst({
      where: { cartId, variantId },
    });
    const newQty = existing ? existing.quantity + quantity : quantity;

    const inv = variant.inventory;
    const stockQty = inv?.stockQuantity ?? 0;
    const reservedQty = inv?.reservedQuantity ?? 0;
    const available = getAvailableStock(stockQty, reservedQty);
    const existingReserved = existing ? (await prisma.inventoryReservation.findUnique({
      where: { cartId_variantId: { cartId, variantId } },
    }))?.quantity ?? 0 : 0;
    const availableForCart = available + existingReserved;
    if (newQty > availableForCart) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 },
      );
    }

    const reserveResult = await reserveStock(cartId, variantId, newQty);
    if (!reserveResult.ok) {
      return NextResponse.json(
        { error: reserveResult.error ?? "Insufficient stock" },
        { status: 400 },
      );
    }

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId, variantId, quantity },
      });
    }

    const response = NextResponse.json({ success: true, cartId });
    response.cookies.set(CART_COOKIE_NAME, cartId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  } catch (error) {
    console.error("[POST /api/cart]", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  let cartId = cookieStore.get(CART_COOKIE_NAME)?.value ?? null;
  cartId = await resolveCartId(cartId, request);

  if (!cartId) {
    return NextResponse.json({ error: "No cart" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const { cartItemId, quantity } = body as { cartItemId?: string; quantity?: number };

  if (!cartItemId || typeof quantity !== "number" || quantity < 0) {
    return NextResponse.json(
      { error: "cartItemId and quantity (>= 0) required" },
      { status: 400 },
    );
  }

  try {
    await releaseExpiredReservations();

    const item = await prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId },
      include: { variant: { include: { inventory: true } } },
    });
    if (!item) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    if (quantity === 0) {
      await releaseReservation(cartId, item.variantId);
      await prisma.cartItem.deleteMany({
        where: { id: cartItemId, cartId },
      });
      return NextResponse.json({ success: true });
    }

    const inv = item.variant.inventory;
    const stockQty = inv?.stockQuantity ?? 0;
    const reservedQty = inv?.reservedQuantity ?? 0;
    const available = getAvailableStock(stockQty, reservedQty);
    const existingReserved = (await prisma.inventoryReservation.findUnique({
      where: { cartId_variantId: { cartId, variantId: item.variantId } },
    }))?.quantity ?? 0;
    const availableForCart = available + existingReserved;
    if (quantity > availableForCart) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 },
      );
    }

    const reserveResult = await reserveStock(cartId, item.variantId, quantity);
    if (!reserveResult.ok) {
      return NextResponse.json(
        { error: reserveResult.error ?? "Insufficient stock" },
        { status: 400 },
      );
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/cart]", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  let cartId = cookieStore.get(CART_COOKIE_NAME)?.value ?? null;
  cartId = await resolveCartId(cartId, request);

  if (!cartId) {
    return NextResponse.json({ error: "No cart" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const cartItemId = searchParams.get("cartItemId");

  if (!cartItemId) {
    return NextResponse.json(
      { error: "cartItemId query param required" },
      { status: 400 },
    );
  }

  try {
    await releaseExpiredReservations();

    const item = await prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId },
      select: { variantId: true },
    });
    if (item) {
      await releaseReservation(cartId, item.variantId);
    }

    await prisma.cartItem.deleteMany({
      where: { id: cartItemId, cartId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/cart]", error);
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 },
    );
  }
}
