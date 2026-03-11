import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 12;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = Number(searchParams.get("page") ?? "1");
  const take = Number(searchParams.get("pageSize") ?? PAGE_SIZE);
  const skip = (page - 1) * take;

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          variants: {
            include: {
              inventory: true,
            },
          },
        },
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

