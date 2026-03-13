"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type OrderRow = {
  id: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  shippingName: string | null;
  createdAt: string;
};

type Props = {
  orders: OrderRow[];
};

export function AdminOrdersTable({ orders }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === orders.length) setSelected(new Set());
    else setSelected(new Set(orders.map((o) => o.id)));
  };

  const runBulkAction = async (action: string) => {
    if (selected.size === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), action }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setSelected(new Set());
        router.refresh();
      } else {
        alert(data.error ?? "Action failed");
      }
    } catch {
      alert("Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-soft bg-gray-soft/30 px-4 py-2">
          <span className="text-sm font-medium text-gray-deep/90">
            {selected.size} selected
          </span>
          <button
            type="button"
            disabled={loading}
            onClick={() => runBulkAction("mark_processing")}
            className="rounded border border-gray-deep/40 bg-white px-3 py-1.5 text-xs font-medium text-gray-deep hover:bg-gray-soft/50 disabled:opacity-50"
          >
            Mark processing
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => runBulkAction("mark_shipped")}
            className="rounded border border-ink bg-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-ink/90 disabled:opacity-50"
          >
            Mark shipped
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => runBulkAction("mark_delivered")}
            className="rounded border border-gray-deep/40 bg-white px-3 py-1.5 text-xs font-medium text-gray-deep hover:bg-gray-soft/50 disabled:opacity-50"
          >
            Mark delivered
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-xs text-gray-deep/80 hover:underline"
          >
            Clear
          </button>
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-gray-soft bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-soft bg-gray-soft/40 text-xs uppercase tracking-[0.18em] text-gray-deep/70">
            <tr>
              <th className="w-10 px-2 py-3">
                <input
                  type="checkbox"
                  checked={orders.length > 0 && selected.size === orders.length}
                  onChange={toggleAll}
                  aria-label="Select all"
                  className="rounded border-gray-deep/40"
                />
              </th>
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
                <td className="w-10 px-2 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(o.id)}
                    onChange={() => toggle(o.id)}
                    aria-label={`Select order ${o.id.slice(0, 8)}`}
                    className="rounded border-gray-deep/40"
                  />
                </td>
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
                  {o.createdAt.slice(0, 10)}
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
                  colSpan={8}
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
