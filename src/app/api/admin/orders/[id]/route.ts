import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit-log";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[GET /api/admin/orders/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { orderStatus } = body as { orderStatus?: string };
  if (!orderStatus) {
    return NextResponse.json(
      { error: "orderStatus is required" },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.order.findUnique({ where: { id }, select: { orderStatus: true } });
    const updated = await prisma.order.update({
      where: { id },
      data: { orderStatus },
    });
    if (existing && existing.orderStatus !== orderStatus) {
      await logAudit({
        entityType: "order",
        entityId: id,
        action: "update",
        field: "orderStatus",
        oldValue: existing.orderStatus,
        newValue: orderStatus,
      });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/orders/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
