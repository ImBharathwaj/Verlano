import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** Generate a random numeric slug (e.g. 12 digits). */
function generateRandomSlug(): string {
  const min = 1e11; // 12 digits min
  const max = 1e12 - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

async function ensureUniqueSlug(
  tx: { product: { findFirst: (arg: { where: { slug: string } }) => Promise<{ slug: string } | null> } },
  baseSlug: string
): Promise<string> {
  let slug = baseSlug;
  while (await tx.product.findFirst({ where: { slug } })) {
    slug = generateRandomSlug();
  }
  return slug;
}

export async function GET(request: Request) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        variants: { include: { inventory: true } },
        images: true,
      },
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
    categories,
    price,
    comparePrice,
    variants,
    images,
  } = body as {
    title?: string;
    slug?: string;
    description?: string;
    brand?: string;
    categories?: string[] | null;
    price?: number;
    comparePrice?: number | null;
    variants?: { size: string; color?: string | null; price: number; stockQuantity: number }[];
    images?: { url: string; alt?: string | null; isPrimary?: boolean; position?: number }[];
  };

  if (!title || !description || !brand || typeof price !== "number") {
    return NextResponse.json(
      { error: "title, description, brand and price are required" },
      { status: 400 },
    );
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const finalSlug =
        slug && slug.trim().length > 0
          ? await ensureUniqueSlug(tx, slug.trim())
          : await ensureUniqueSlug(tx, generateRandomSlug());
      const product = await tx.product.create({
        data: {
          title,
          slug: finalSlug,
          description,
          brand,
          categories: Array.isArray(categories)
            ? categories.filter((c) => typeof c === "string" && c.trim().length > 0).map((c) => c.trim().toLowerCase())
            : [],
          price,
          comparePrice: comparePrice ?? null,
        },
      });

      if (variants && variants.length > 0) {
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];
          const colorPart = (v.color && String(v.color).trim()) || "std";
          const sku = `${finalSlug}-${v.size}-${colorPart.replace(/\s+/g, "-")}-${i + 1}`;
          const variant = await tx.productVariant.create({
            data: {
              productId: product.id,
              size: v.size,
              color: (v.color && String(v.color).trim()) || null,
              price: v.price,
              sku,
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

      if (images && images.length > 0) {
        let normalized = images
          .filter((img) => img.url && img.url.trim().length > 0)
          .map((img, index) => ({
            url: img.url,
            alt: img.alt ?? null,
            isPrimary: img.isPrimary ?? false,
            position: img.position ?? index,
            productId: product.id,
          }));

        if (!normalized.some((img) => img.isPrimary) && normalized.length > 0) {
          normalized = normalized.map((img, index) => ({
            ...img,
            isPrimary: index === 0,
          }));
        }

        if (normalized.length > 0) {
          await tx.productImage.createMany({
            data: normalized,
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
