import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const o = body as Record<string, unknown>;
    const code = typeof o.code === "string" ? o.code.trim().toUpperCase() : "";
    const type = typeof o.type === "string" ? o.type : "percent";
    const value = typeof o.value === "number" ? Math.round(o.value) : 0;
    const minOrderAmount = typeof o.minOrderAmount === "number" ? Math.round(o.minOrderAmount) : null;
    const maxUses = typeof o.maxUses === "number" ? Math.max(0, Math.round(o.maxUses)) : null;
    const expiresAt = typeof o.expiresAt === "string" ? new Date(o.expiresAt) : null;

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }
    if (type !== "percent" && type !== "fixed") {
      return NextResponse.json({ error: "Type must be percent or fixed" }, { status: 400 });
    }
    if (type === "percent" && (value < 1 || value > 100)) {
      return NextResponse.json({ error: "Percent value must be 1-100" }, { status: 400 });
    }
    if (type === "fixed" && value < 1) {
      return NextResponse.json({ error: "Fixed value must be positive" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        type,
        value,
        minOrderAmount,
        maxUses,
        expiresAt,
      },
    });
    return NextResponse.json({ coupon });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    }
    console.error("[POST /api/admin/coupons]", error);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ coupons });
}
