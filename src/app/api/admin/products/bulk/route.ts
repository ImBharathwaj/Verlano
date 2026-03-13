import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { CATEGORY_OPTIONS } from "@/lib/categories";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const guard = requireAdmin(request);
  if (guard) return guard;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { ids, brand, categories } = body as {
    ids?: unknown;
    brand?: string;
    categories?: string[] | string;
  };
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids (array) is required" }, { status: 400 });
  }
  const validIds = ids.filter((id): id is string => typeof id === "string");
  if (validIds.length === 0) {
    return NextResponse.json({ error: "No valid product ids" }, { status: 400 });
  }

  const updates: { brand?: string; categories?: string[] } = {};
  if (typeof brand === "string" && brand.trim()) {
    updates.brand = brand.trim();
  }
  if (categories !== undefined) {
    const arr = Array.isArray(categories)
      ? categories
      : typeof categories === "string"
        ? categories.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean)
        : [];
    const valid = arr.filter((c) => CATEGORY_OPTIONS.includes(c as (typeof CATEGORY_OPTIONS)[number]));
    updates.categories = valid.length > 0 ? valid : [];
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Provide brand and/or categories to update" },
      { status: 400 }
    );
  }

  const result = await prisma.product.updateMany({
    where: { id: { in: validIds } },
    data: updates,
  });
  return NextResponse.json({ updated: result.count });
}
