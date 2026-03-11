import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: { inventory: true },
        },
      },
    });
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("[GET /api/admin/products/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
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

  const {
    title,
    slug,
    description,
    brand,
    price,
    comparePrice,
  } = body as {
    title?: string;
    slug?: string;
    description?: string;
    brand?: string;
    price?: number;
    comparePrice?: number | null;
  };

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(slug ? { slug } : {}),
        ...(description ? { description } : {}),
        ...(brand ? { brand } : {}),
        ...(typeof price === "number" ? { price } : {}),
        ...(typeof comparePrice === "number"
          ? { comparePrice }
          : comparePrice === null
            ? { comparePrice: null }
            : {}),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/products/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const { id } = await params;
  try {
    await prisma.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { productId: id },
        select: { id: true },
      });
      const variantIds = variants.map((v) => v.id);

      if (variantIds.length > 0) {
        await tx.cartItem.deleteMany({ where: { variantId: { in: variantIds } } });
        await tx.orderItem.deleteMany({ where: { variantId: { in: variantIds } } });
        await tx.inventory.deleteMany({ where: { variantId: { in: variantIds } } });
        await tx.productVariant.deleteMany({ where: { id: { in: variantIds } } });
      }

      await tx.product.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/products/[id]]", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
