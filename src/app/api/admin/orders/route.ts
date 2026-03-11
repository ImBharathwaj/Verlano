import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        payment: true,
      },
    });

    const data = orders.map((o) => ({
      id: o.id,
      createdAt: o.createdAt,
      totalAmount: o.totalAmount,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      shippingName: o.shippingName,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/admin/orders]", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
