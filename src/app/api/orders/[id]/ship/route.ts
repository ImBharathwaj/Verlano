import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createShipmentForOrder } from "@/lib/shiprocket";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.shippingStatus && order.shippingStatus !== "created") {
      return NextResponse.json({ success: true, orderId: order.id });
    }

    const shipment = await createShipmentForOrder(order.id);

    if (!shipment) {
      return NextResponse.json(
        { error: "Shipping provider not configured" },
        { status: 503 },
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        shippingProvider: shipment.shippingProvider,
        trackingId: shipment.trackingId,
        trackingUrl: shipment.trackingUrl,
        shippingStatus: shipment.shippingStatus,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      trackingId: shipment.trackingId,
      trackingUrl: shipment.trackingUrl,
      shippingProvider: shipment.shippingProvider,
      shippingStatus: shipment.shippingStatus,
    });
  } catch (error) {
    console.error("[POST /api/orders/[id]/ship]", error);
    return NextResponse.json(
      { error: "Failed to create shipment" },
      { status: 500 },
    );
  }
}

