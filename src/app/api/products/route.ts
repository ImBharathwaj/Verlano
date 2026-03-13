import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 12;

const include = {
  variants: { include: { inventory: true } },
  images: { orderBy: { position: "asc" as const } },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");

  try {
    if (idsParam?.trim()) {
      const ids = idsParam.split(",").map((id) => id.trim()).filter(Boolean);
      if (ids.length > 0) {
        const products = await prisma.product.findMany({
          where: { id: { in: ids } },
          include,
        });
        return NextResponse.json({ data: products });
      }
    }

    const page = Number(searchParams.get("page") ?? "1");
    const take = Number(searchParams.get("pageSize") ?? PAGE_SIZE);
    const skip = (page - 1) * take;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include,
      }),
      prisma.product.count(),
    ]);

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        pageSize: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

