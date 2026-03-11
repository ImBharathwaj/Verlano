import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: {
    slug: string;
  };
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = params;

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        variants: {
          include: {
            inventory: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("[GET /api/products/[slug]]", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

