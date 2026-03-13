import Link from "next/link";
import { prisma } from "@/lib/prisma";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = new Date(todayStart);
  weekStart.setUTCDate(weekStart.getUTCDate() - 7);
  const monthStart = new Date(todayStart);
  monthStart.setUTCMonth(monthStart.getUTCMonth() - 1);

  const LOW_STOCK_THRESHOLD = 5;
  const [
    productCount,
    orderCount,
    totalRevenue,
    ordersToday,
    revenueToday,
    ordersThisWeek,
    revenueThisWeek,
    ordersThisMonth,
    revenueThisMonth,
    lowStockVariants,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: todayStart }, paymentStatus: "paid" },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: weekStart }, paymentStatus: "paid" },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: monthStart }, paymentStatus: "paid" },
      _sum: { totalAmount: true },
    }),
    prisma.productVariant.findMany({
      where: {
        OR: [
          { inventory: null },
          { inventory: { stockQuantity: { lt: LOW_STOCK_THRESHOLD } } },
        ],
      },
      include: { product: { select: { id: true, title: true, slug: true } }, inventory: true },
    }),
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
            Orders (total)
          </p>
          <p className="mt-2 text-2xl font-semibold">{orderCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-soft bg-white px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-deep/70">
            Gross revenue (all time)
          </p>
          <p className="mt-2 text-2xl font-semibold">
            ₹{(revenue / 100).toFixed(0)}
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-soft bg-white px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-deep/70">
            Today
          </p>
          <p className="mt-2 text-lg font-semibold">{ordersToday} orders</p>
          <p className="text-sm text-gray-deep/80">
            ₹{((revenueToday._sum.totalAmount ?? 0) / 100).toFixed(0)} revenue
          </p>
        </div>
        <div className="rounded-2xl border border-gray-soft bg-white px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-deep/70">
            Last 7 days
          </p>
          <p className="mt-2 text-lg font-semibold">{ordersThisWeek} orders</p>
          <p className="text-sm text-gray-deep/80">
            ₹{((revenueThisWeek._sum.totalAmount ?? 0) / 100).toFixed(0)} revenue
          </p>
        </div>
        <div className="rounded-2xl border border-gray-soft bg-white px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-deep/70">
            Last 30 days
          </p>
          <p className="mt-2 text-lg font-semibold">{ordersThisMonth} orders</p>
          <p className="text-sm text-gray-deep/80">
            ₹{((revenueThisMonth._sum.totalAmount ?? 0) / 100).toFixed(0)} revenue
          </p>
        </div>
      </div>
      {lowStockVariants.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-800/80">
            Low stock (&lt; {LOW_STOCK_THRESHOLD} units)
          </p>
          <p className="mt-2 text-lg font-semibold text-amber-900">
            {lowStockVariants.length} variant{lowStockVariants.length !== 1 ? "s" : ""}
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {lowStockVariants.slice(0, 10).map((v) => (
              <li key={v.id}>
                <Link
                  href={`/admin/products/${v.product.id}`}
                  className="text-amber-900 underline hover:no-underline"
                >
                  {v.product.title} — {v.size}
                  {v.color ? ` / ${v.color}` : ""} (
                  {v.inventory?.stockQuantity ?? 0} left)
                </Link>
              </li>
            ))}
          </ul>
          {lowStockVariants.length > 10 && (
            <p className="mt-2 text-xs text-amber-800/80">
              +{lowStockVariants.length - 10} more — edit products to restock
            </p>
          )}
        </div>
      )}
    </div>
  );
}
