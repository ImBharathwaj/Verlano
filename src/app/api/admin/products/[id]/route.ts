import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { minioClient, MINIO_BUCKET, MINIO_PUBLIC_BASE_URL } from "@/lib/minio";

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
    price,
    comparePrice,
    images,
  } = body as {
    title?: string;
    slug?: string;
    description?: string;
    brand?: string;
    price?: number;
    comparePrice?: number | null;
    images?: { url: string; alt?: string | null; isPrimary?: boolean; position?: number }[];
  };

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
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

      return product;
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/products/[id]]", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
