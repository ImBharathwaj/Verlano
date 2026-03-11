import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [productCount, orderCount, totalRevenue] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
  ]);

  const revenue = totalRevenue._sum.totalAmount ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
      <p className="text-sm text-gray-deep/80">
        Quick overview of products and orders.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-soft bg-white px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-deep/70">
            Products
          </p>
          <p className="mt-2 text-2xl font-semibold">{productCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-soft bg-white px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-deep/70">
            Orders
          </p>
          <p className="mt-2 text-2xl font-semibold">{orderCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-soft bg-white px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-deep/70">
            Gross revenue
          </p>
          <p className="mt-2 text-2xl font-semibold">
            ₹{(revenue / 100).toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  );
}
