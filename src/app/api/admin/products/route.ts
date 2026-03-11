import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { variants: { include: { inventory: true } } },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("[GET /api/admin/products]", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const guard = requireAdmin(request);
  if (guard) return guard;

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
    variants,
  } = body as {
    title?: string;
    slug?: string;
    description?: string;
    brand?: string;
    price?: number;
    comparePrice?: number | null;
    variants?: { size: string; price: number; stockQuantity: number }[];
  };

  if (!title || !slug || !description || !brand || typeof price !== "number") {
    return NextResponse.json(
      { error: "title, slug, description, brand and price are required" },
      { status: 400 },
    );
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          title,
          slug,
          description,
          brand,
          price,
          comparePrice: comparePrice ?? null,
        },
      });

      if (variants && variants.length > 0) {
        for (const v of variants) {
          const variant = await tx.productVariant.create({
            data: {
              productId: product.id,
              size: v.size,
              price: v.price,
              sku: `${slug}-${v.size}`,
            },
          });
          await tx.inventory.create({
            data: {
              variantId: variant.id,
              stockQuantity: v.stockQuantity,
            },
          });
        }
      }

      return product;
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/products]", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
