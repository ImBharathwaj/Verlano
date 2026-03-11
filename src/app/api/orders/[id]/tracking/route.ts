import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        shippingProvider: true,
        trackingId: true,
        trackingUrl: true,
        shippingStatus: true,
        orderStatus: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[GET /api/orders/[id]/tracking]", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking info" },
      { status: 500 },
    );
  }
}

