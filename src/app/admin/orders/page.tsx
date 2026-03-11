import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-gray-deep/80">
            View and manage customer orders.
          </p>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-soft bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-soft bg-gray-soft/40 text-xs uppercase tracking-[0.18em] text-gray-deep/70">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-gray-soft/70">
                <td className="px-4 py-3 text-xs text-gray-deep/90">
                  #{o.id.slice(0, 8)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-deep/80">
                  {o.shippingName ?? "Guest"}
                </td>
                <td className="px-4 py-3 text-sm">
                  ₹{(o.totalAmount / 100).toFixed(0)}
                </td>
                <td className="px-4 py-3 text-xs text-gray-deep/80">
                  {o.paymentStatus}
                </td>
                <td className="px-4 py-3 text-xs text-gray-deep/80">
                  {o.orderStatus}
                </td>
                <td className="px-4 py-3 text-xs text-gray-deep/70">
                  {o.createdAt.toISOString().slice(0, 10)}
                </td>
                <td className="px-4 py-3 text-right text-xs">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-gray-deep/80 hover:text-black"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-sm text-gray-deep/70"
                >
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
