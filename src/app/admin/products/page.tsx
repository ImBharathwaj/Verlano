import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminProductsTable } from "@/components/admin/AdminProductsTable";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, brand: true, price: true, categories: true, createdAt: true },
  });

  const serialized = products.map((p) => ({
    id: p.id,
    title: p.title,
    brand: p.brand,
    price: p.price,
    categories: p.categories,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-gray-deep/80">
            Manage your catalog. Select rows to update brand or categories in bulk.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
        >
          New product
        </Link>
      </div>
      <AdminProductsTable products={serialized} />
    </div>
  );
}
