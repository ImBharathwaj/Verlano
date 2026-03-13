import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit-log";

export const dynamic = "force-dynamic";

const VALID_ACTIONS = ["mark_shipped", "mark_processing", "mark_delivered"] as const;
type BulkAction = (typeof VALID_ACTIONS)[number];

const ACTION_TO_STATUS: Record<BulkAction, string> = {
  mark_shipped: "shipped",
  mark_processing: "processing",
  mark_delivered: "delivered",
};

export async function PATCH(request: Request) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { ids, action } = body as { ids?: unknown; action?: string };
  if (!Array.isArray(ids) || ids.length === 0 || typeof action !== "string") {
    return NextResponse.json(
      { error: "ids (array) and action are required" },
      { status: 400 }
    );
  }
  const validIds = ids.filter((id): id is string => typeof id === "string");
  if (validIds.length === 0) {
    return NextResponse.json({ error: "No valid order ids" }, { status: 400 });
  }
  if (!VALID_ACTIONS.includes(action as BulkAction)) {
    return NextResponse.json(
      { error: `action must be one of: ${VALID_ACTIONS.join(", ")}` },
      { status: 400 }
    );
  }
  const newStatus = ACTION_TO_STATUS[action as BulkAction];
  const orders = await prisma.order.findMany({
    where: { id: { in: validIds } },
    select: { id: true, orderStatus: true },
  });
  const result = await prisma.order.updateMany({
    where: { id: { in: validIds } },
    data: { orderStatus: newStatus },
  });
  for (const order of orders) {
    if (order.orderStatus !== newStatus) {
      await logAudit({
        entityType: "order",
        entityId: order.id,
        action: "update",
        field: "orderStatus",
        oldValue: order.orderStatus,
        newValue: newStatus,
      });
    }
  }
  return NextResponse.json({ updated: result.count });
}
