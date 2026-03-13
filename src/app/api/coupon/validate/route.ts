import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupon";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const code = typeof (body as { code?: unknown }).code === "string" ? (body as { code: string }).code : "";
    const subtotal = typeof (body as { subtotal?: unknown }).subtotal === "number" ? (body as { subtotal: number }).subtotal : 0;

    if (subtotal <= 0) {
      return NextResponse.json({ error: "Subtotal is required" }, { status: 400 });
    }

    const result = await validateCoupon(code, Math.round(subtotal));
    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error });
    }
    return NextResponse.json({
      valid: true,
      discountAmount: result.discountAmount,
      couponCode: result.couponCode,
      finalAmount: Math.max(0, subtotal - result.discountAmount),
    });
  } catch (error) {
    console.error("[POST /api/coupon/validate]", error);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
