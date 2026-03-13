import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ productIds: [] });
    }
    const items = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      select: { productId: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({
      productIds: items.map((i) => i.productId),
    });
  } catch (error) {
    console.error("[GET /api/wishlist]", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Sign in to save products" }, { status: 401 });
    }
    const body = await request.json().catch(() => null);
    const productId = typeof body?.productId === "string" ? body.productId.trim() : null;
    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    await prisma.wishlistItem.upsert({
      where: {
        userId_productId: { userId: user.id, productId },
      },
      create: { userId: user.id, productId },
      update: {},
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/wishlist]", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Sign in to manage wishlist" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId")?.trim();
    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }
    await prisma.wishlistItem.deleteMany({
      where: { userId: user.id, productId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/wishlist]", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 },
    );
  }
}
