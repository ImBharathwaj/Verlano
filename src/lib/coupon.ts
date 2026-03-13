import { prisma } from "@/lib/prisma";

export type CouponResult =
  | { valid: true; discountAmount: number; couponCode: string }
  | { valid: false; error: string };

export async function validateCoupon(
  code: string,
  subtotalPaise: number
): Promise<CouponResult> {
  const trimmed = code?.trim().toUpperCase();
  if (!trimmed) {
    return { valid: false, error: "Coupon code is required" };
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: trimmed },
  });

  if (!coupon) {
    return { valid: false, error: "Invalid coupon code" };
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return { valid: false, error: "Coupon has expired" };
  }

  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "Coupon has reached its usage limit" };
  }

  if (coupon.minOrderAmount != null && subtotalPaise < coupon.minOrderAmount) {
    const minRupees = (coupon.minOrderAmount / 100).toFixed(0);
    return {
      valid: false,
      error: `Minimum order amount of ₹${minRupees} required for this coupon`,
    };
  }

  let discountAmount: number;
  if (coupon.type === "percent") {
    discountAmount = Math.floor((subtotalPaise * coupon.value) / 100);
  } else if (coupon.type === "fixed") {
    discountAmount = Math.min(coupon.value, subtotalPaise);
  } else {
    return { valid: false, error: "Invalid coupon" };
  }

  if (discountAmount <= 0) {
    return { valid: false, error: "Coupon does not apply to this order" };
  }

  return {
    valid: true,
    discountAmount,
    couponCode: coupon.code,
  };
}

export async function incrementCouponUsage(code: string): Promise<void> {
  await prisma.coupon.updateMany({
    where: { code: code.trim().toUpperCase() },
    data: { usedCount: { increment: 1 } },
  });
}
