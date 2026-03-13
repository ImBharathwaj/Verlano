import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit-log";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { minioClient, MINIO_BUCKET, MINIO_PUBLIC_BASE_URL } from "@/lib/minio";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: { inventory: true },
        },
        images: true,
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
    categories,
    price,
    comparePrice,
    images,
    variants,
  } = body as {
    title?: string;
    slug?: string;
    description?: string;
    brand?: string;
    categories?: string[] | null;
    price?: number;
    comparePrice?: number | null;
    images?: { url: string; alt?: string | null; isPrimary?: boolean; position?: number }[];
    variants?: { id?: string; size: string; color?: string | null; price: number; stockQuantity: number }[];
  };

  try {
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { title: true, slug: true, brand: true, price: true, comparePrice: true, categories: true },
    });
    const updated = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          ...(title ? { title } : {}),
          ...(slug ? { slug } : {}),
          ...(description ? { description } : {}),
          ...(brand ? { brand } : {}),
          ...(categories !== undefined
            ? {
                categories: Array.isArray(categories)
                  ? categories.filter((c) => typeof c === "string" && c.trim().length > 0).map((c) => c.trim().toLowerCase())
                  : [],
              }
            : {}),
          ...(typeof price === "number" ? { price } : {}),
          ...(typeof comparePrice === "number"
            ? { comparePrice }
            : comparePrice === null
              ? { comparePrice: null }
              : {}),
        },
      });

      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });

        let normalized = images
          .filter((img) => img.url && img.url.trim().length > 0)
          .map((img, index) => ({
            url: img.url,
            alt: img.alt ?? null,
            isPrimary: img.isPrimary ?? false,
            position: img.position ?? index,
            productId: id,
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

      if (Array.isArray(variants) && variants.length > 0) {
        const current = await tx.product.findUnique({
          where: { id },
          select: { slug: true },
        });
        const productSlug = current?.slug ?? id;
        let newVariantIndex = 0;
        for (const v of variants) {
          if (v.id) {
            const existing = await tx.productVariant.findFirst({
              where: { id: v.id, productId: id },
              include: { inventory: true },
            });
            if (existing) {
              await tx.productVariant.update({
                where: { id: v.id },
                data: { size: v.size, color: (v.color && String(v.color).trim()) || null, price: v.price },
              });
              if (existing.inventory) {
                await tx.inventory.update({
                  where: { variantId: v.id },
                  data: { stockQuantity: v.stockQuantity },
                });
              } else {
                await tx.inventory.create({
                  data: { variantId: v.id, stockQuantity: v.stockQuantity },
                });
              }
            }
          } else if (v.size && String(v.size).trim()) {
            const colorPart = (v.color && String(v.color).trim()) || "std";
            const sku = `${productSlug}-${v.size}-${colorPart.replace(/\s+/g, "-")}-${Date.now()}-${++newVariantIndex}`;
            const newVariant = await tx.productVariant.create({
              data: {
                productId: id,
                size: v.size.trim(),
                color: (v.color && String(v.color).trim()) || null,
                price: v.price,
                sku,
              },
            });
            await tx.inventory.create({
              data: { variantId: newVariant.id, stockQuantity: v.stockQuantity },
            });
          }
        }
      }

      const result = await tx.product.findUnique({
        where: { id },
        include: { variants: { include: { inventory: true } }, images: true },
      });
      if (!result) throw new Error("Product not found");
      return result;
    });
    if (existing) {
      const changes: Record<string, { old: unknown; new: unknown }> = {};
      if (title !== undefined && existing.title !== title) changes.title = { old: existing.title, new: title };
      if (slug !== undefined && existing.slug !== slug) changes.slug = { old: existing.slug, new: slug };
      if (brand !== undefined && existing.brand !== brand) changes.brand = { old: existing.brand, new: brand };
      if (typeof price === "number" && existing.price !== price) changes.price = { old: existing.price, new: price };
      if (comparePrice !== undefined && existing.comparePrice !== comparePrice) changes.comparePrice = { old: existing.comparePrice, new: comparePrice };
      if (categories !== undefined) {
        const newCategories = Array.isArray(categories)
          ? categories.filter((c) => typeof c === "string" && c.trim().length > 0).map((c) => c.trim().toLowerCase())
          : [];
        if (JSON.stringify(existing.categories) !== JSON.stringify(newCategories)) {
          changes.categories = { old: existing.categories, new: newCategories };
        }
      }
      if (Object.keys(changes).length > 0) {
        await logAudit({
          entityType: "product",
          entityId: id,
          action: "update",
          field: Object.keys(changes).join(","),
          oldValue: JSON.stringify(Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, v.old]))),
          newValue: JSON.stringify(Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, v.new]))),
        });
      }
    }
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
    const product = await prisma.product.findUnique({
      where: { id },
      select: { title: true, slug: true },
    });
    // Load image URLs before deleting DB rows so we can remove files from MinIO.
    const images = await prisma.productImage.findMany({
      where: { productId: id },
      select: { url: true },
    });

    // Delete related DB records in a transaction.
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

      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });

    // Best-effort cleanup of images in MinIO (outside the DB transaction).
    if (images.length > 0) {
      const base = MINIO_PUBLIC_BASE_URL.replace(/\/$/, "");
      const objects = images
        .map(({ url }) => {
          if (!url) return null;
          // Expected formats:
          // - http://host:port/bucket/key
          // - http://host:port/key  (if bucket is implied)
          const withoutBase = url.startsWith(base) ? url.slice(base.length) : url;
          const cleaned = withoutBase.replace(/^\/+/, ""); // remove leading slashes

          // If the URL still starts with bucket name, strip it.
          const key =
            cleaned.toLowerCase().startsWith(MINIO_BUCKET.toLowerCase() + "/")
              ? cleaned.slice(MINIO_BUCKET.length + 1)
              : cleaned;

          if (!key) return null;
          return { Key: key };
        })
        .filter((o): o is { Key: string } => !!o);

      if (objects.length > 0) {
        try {
          await minioClient.send(
            new DeleteObjectsCommand({
              Bucket: MINIO_BUCKET,
              Delete: { Objects: objects },
            }),
          );
        } catch (err) {
          console.error(
            "[DELETE /api/admin/products/[id]] Failed to delete images from MinIO",
            err,
          );
        }
      }
    }

    if (product) {
      await logAudit({
        entityType: "product",
        entityId: id,
        action: "delete",
        field: "product",
        oldValue: JSON.stringify({ title: product.title, slug: product.slug }),
        newValue: undefined,
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/products/[id]]", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
