"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
];

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  variant: {
    size: string;
    product: {
      title: string;
      slug: string;
    };
  };
};

type Order = {
  id: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingStreet: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingProvider: string | null;
  trackingId: string | null;
  trackingUrl: string | null;
  shippingStatus: string | null;
  items: OrderItem[];
};

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to load order");
        } else {
          setOrder({
            ...data,
            createdAt: data.createdAt,
          });
        }
      } catch {
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = e.target.value;
    if (!order) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update status");
      } else {
        setOrder((prev) => (prev ? { ...prev, orderStatus: value } : prev));
      }
    } catch {
      setError("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="py-12 text-sm text-gray-deep/80">Loading...</p>;
  }

  if (!order) {
    return <p className="py-12 text-sm text-red-600">Order not found.</p>;
  }

  const created = new Date(order.createdAt).toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Order</h1>
          <p className="mt-1 text-sm text-gray-deep/80">
            #{order.id.slice(0, 8)} — created {created}
          </p>
        </div>
        <div className="space-x-2 text-sm">
          <span className="text-gray-deep/80">Status:</span>
          <select
            value={order.orderStatus}
            onChange={handleStatusChange}
            disabled={saving}
            className="rounded-full border border-gray-soft bg-white px-3 py-1 text-xs text-black"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid gap-6 md:grid-cols-[1.5fr,1fr]">
        <section className="space-y-4 rounded-2xl border border-gray-soft bg-white px-6 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-deep/80">
            Items
          </h2>
          <ul className="space-y-3 text-sm">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between border-b border-gray-soft/60 pb-2 last:border-b-0"
              >
                <div className="space-y-1">
                  <p className="text-gray-deep/90">
                    {item.variant.product.title}
                  </p>
                  <p className="text-xs text-gray-deep/70">
                    Size {item.variant.size} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  ₹{((item.price * item.quantity) / 100).toFixed(0)}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-4 rounded-2xl border border-gray-soft bg-white px-6 py-6">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-deep/80">
              Shipping
            </h2>
            <p className="mt-2 text-sm text-gray-deep/90">
              {order.shippingName ?? "Guest"}
            </p>
            <p className="text-sm text-gray-deep/80">
              {order.shippingPhone}
            </p>
            <p className="mt-1 text-xs text-gray-deep/80">
              {order.shippingStreet}
              <br />
              {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
            </p>
          </div>
          <div>
            <h2 className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-deep/80">
              Payment & shipping
            </h2>
            <p className="mt-2 text-sm text-gray-deep/80">
              Payment: {order.paymentStatus}
            </p>
            <p className="text-sm text-gray-deep/80">
              Total: ₹{(order.totalAmount / 100).toFixed(0)}
            </p>
            {order.shippingProvider && (
              <p className="mt-2 text-xs text-gray-deep/70">
                Provider: {order.shippingProvider}
                <br />
                Tracking ID: {order.trackingId}
                <br />
                Status: {order.shippingStatus}
              </p>
            )}
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs font-medium text-black underline"
              >
                Open tracking link
              </a>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
