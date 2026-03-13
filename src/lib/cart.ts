import { prisma } from "@/lib/prisma";
import { reserveStock, releaseReservation, getAvailableStock } from "@/lib/inventory-reservation";

export const CART_COOKIE_NAME = "verlano_cart_id";

export function getCartIdFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${CART_COOKIE_NAME}=([^;]+)`));
  return match ? match[1].trim() : null;
}

/**
 * On login: get or create the user's cart, merge in guest cart items if any, delete guest cart.
 * Returns the user's cart id so the response can set the cart cookie.
 */
export async function mergeGuestCartIntoUserCart(
  guestCartId: string | null,
  userId: string
): Promise<string> {
  let userCart = await prisma.cart.findFirst({ where: { userId } });
  if (!userCart) {
    userCart = await prisma.cart.create({ data: { userId } });
  }

  if (!guestCartId || guestCartId === userCart.id) {
    return userCart.id;
  }

  const guestCart = await prisma.cart.findFirst({
    where: { id: guestCartId, userId: null },
    include: {
      items: { include: { variant: { include: { inventory: true } } } },
    },
  });

  if (!guestCart) {
    return userCart.id;
  }

  for (const item of guestCart.items) {
    await releaseReservation(guestCart.id, item.variantId);
  }

  for (const item of guestCart.items) {
    const inv = item.variant.inventory;
    const stockQty = inv?.stockQuantity ?? 0;
    const reservedQty = inv?.reservedQuantity ?? 0;
    const available = getAvailableStock(stockQty, reservedQty);
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: userCart.id, variantId: item.variantId },
    });
    const addQty = existing ? Math.min(item.quantity, Math.max(0, available - existing.quantity)) : Math.min(item.quantity, available);
    if (addQty <= 0) continue;

    const newQty = existing ? existing.quantity + addQty : addQty;
    const reserveResult = await reserveStock(userCart.id, item.variantId, newQty);
    if (!reserveResult.ok) continue;

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: userCart.id, variantId: item.variantId, quantity: addQty },
      });
    }
  }

  await prisma.cartItem.deleteMany({ where: { cartId: guestCart.id } });
  await prisma.cart.delete({ where: { id: guestCart.id } });

  return userCart.id;
}
