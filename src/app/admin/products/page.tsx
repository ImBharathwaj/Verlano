import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-gray-deep/80">
            Manage your catalog.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
        >
          New product
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-soft bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-soft bg-gray-soft/40 text-xs uppercase tracking-[0.18em] text-gray-deep/70">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-gray-soft/70">
                <td className="px-4 py-3 text-gray-deep/90">{p.title}</td>
                <td className="px-4 py-3 text-gray-deep/80">{p.brand}</td>
                <td className="px-4 py-3">
                  ₹{(p.price / 100).toFixed(0)}
                </td>
                <td className="px-4 py-3 text-xs text-gray-deep/70">
                  {p.createdAt.toISOString().slice(0, 10)}
                </td>
                <td className="px-4 py-3 text-right text-xs">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-gray-deep/80 hover:text-black"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-sm text-gray-deep/70"
                >
                  No products yet. Create your first product.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
