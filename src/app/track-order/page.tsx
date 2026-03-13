"use client";

import { useState } from "react";
import Link from "next/link";

type OrderStatus = {
  id: string;
  paymentStatus: string;
  orderStatus: string;
  trackingId: string | null;
  trackingUrl: string | null;
  shippingStatus: string | null;
  totalAmount: number;
  createdAt: string;
};

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderStatus | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({ orderId: orderId.trim(), email: email.trim() });
      const res = await fetch(`/api/orders/by-email?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Order not found");
        return;
      }
      setOrder(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Track your order</h1>
      <p className="mt-2 text-sm text-gray-deep/80">
        Enter your order ID and email to see status and tracking.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-4">
        <div>
          <label htmlFor="orderId" className="mb-1 block text-xs font-medium text-gray-deep/80">
            Order ID
          </label>
          <input
            id="orderId"
            type="text"
            required
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. abc123..."
            className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-medium text-gray-deep/80">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
        >
          {loading ? "Looking up…" : "Track order"}
        </button>
      </form>

      {order && (
        <div className="mt-10 max-w-md rounded-2xl border border-gray-soft bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-deep/80">
            Order {order.id.slice(0, 8)}
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-deep/70">Payment</dt>
              <dd className="font-medium capitalize">{order.paymentStatus}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-deep/70">Status</dt>
              <dd className="font-medium capitalize">{order.orderStatus}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-deep/70">Total</dt>
              <dd>₹{(order.totalAmount / 100).toFixed(0)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-deep/70">Placed</dt>
              <dd>{new Date(order.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
          {order.trackingUrl && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-full border border-ink px-4 py-2 text-sm font-medium text-ink hover:bg-gray-soft/50"
            >
              View tracking
            </a>
          )}
          {order.trackingId && !order.trackingUrl && (
            <p className="mt-2 text-xs text-gray-deep/70">
              Tracking ID: {order.trackingId}
            </p>
          )}
        </div>
      )}

      <p className="mt-8 text-sm text-gray-deep/70">
        <Link href="/" className="underline hover:no-underline">
          Back to home
        </Link>
      </p>
    </main>
  );
}
