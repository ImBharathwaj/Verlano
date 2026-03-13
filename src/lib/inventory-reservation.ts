import { prisma } from "@/lib/prisma";

const RESERVATION_MINUTES = 15;

/**
 * Available stock = stockQuantity - reservedQuantity.
 */
export function getAvailableStock(stockQuantity: number, reservedQuantity: number): number {
  return Math.max(0, stockQuantity - reservedQuantity);
}

/**
 * Release expired reservations (lazy cleanup). Call at start of cart/checkout APIs.
 */
export async function releaseExpiredReservations(): Promise<void> {
  const now = new Date();
  const expired = await prisma.inventoryReservation.findMany({
    where: { expiresAt: { lt: now } },
  });
  if (expired.length === 0) return;

  for (const r of expired) {
    await prisma.$transaction(async (tx) => {
      await tx.inventory.updateMany({
        where: { variantId: r.variantId },
        data: { reservedQuantity: { decrement: r.quantity } },
      });
      await tx.inventoryReservation.delete({ where: { id: r.id } });
    });
  }
}

/**
 * Reserve stock for a cart item. Creates or updates reservation, increments reservedQuantity.
 * Returns true if reserved, false if insufficient stock.
 */
export async function reserveStock(
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<{ ok: boolean; error?: string }> {
  const inv = await prisma.inventory.findUnique({
    where: { variantId },
  });
  if (!inv) return { ok: false, error: "Variant not found" };

  const existing = await prisma.inventoryReservation.findUnique({
    where: { cartId_variantId: { cartId, variantId } },
  });

  const currentReserved = existing?.quantity ?? 0;
  const available = getAvailableStock(inv.stockQuantity, inv.reservedQuantity);
  const availableForThisCart = available + currentReserved;
  if (quantity > availableForThisCart) {
    return { ok: false, error: "Insufficient stock" };
  }

  const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    const delta = quantity - currentReserved;
    if (delta !== 0) {
      await tx.inventory.updateMany({
        where: { variantId },
        data: { reservedQuantity: { increment: delta } },
      });
    }
    await tx.inventoryReservation.upsert({
      where: { cartId_variantId: { cartId, variantId } },
      create: { cartId, variantId, quantity, expiresAt },
      update: { quantity, expiresAt },
    });
  });

  return { ok: true };
}

/**
 * Release reservation for a cart item. Decrements reservedQuantity, deletes reservation.
 */
export async function releaseReservation(
  cartId: string,
  variantId: string,
): Promise<void> {
  const existing = await prisma.inventoryReservation.findUnique({
    where: { cartId_variantId: { cartId, variantId } },
  });
  if (!existing) return;

  await prisma.$transaction(async (tx) => {
    await tx.inventory.updateMany({
      where: { variantId },
      data: { reservedQuantity: { decrement: existing.quantity } },
    });
    await tx.inventoryReservation.delete({ where: { id: existing.id } });
  });
}

/**
 * Release reservations for all items in a cart (e.g. on payment success).
 */
export async function releaseCartReservations(cartId: string): Promise<void> {
  const reservations = await prisma.inventoryReservation.findMany({
    where: { cartId },
  });
  for (const r of reservations) {
    await prisma.$transaction(async (tx) => {
      await tx.inventory.updateMany({
        where: { variantId: r.variantId },
        data: { reservedQuantity: { decrement: r.quantity } },
      });
      await tx.inventoryReservation.delete({ where: { id: r.id } });
    });
  }
}
