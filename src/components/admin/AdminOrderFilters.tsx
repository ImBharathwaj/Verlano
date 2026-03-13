"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

type Props = { orderStatus?: string; paymentStatus?: string };

export function AdminOrderFilters({ orderStatus, paymentStatus }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildUrl = (overrides: { orderStatus?: string; paymentStatus?: string }) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (overrides.orderStatus !== undefined) {
      if (overrides.orderStatus) params.set("orderStatus", overrides.orderStatus);
      else params.delete("orderStatus");
    }
    if (overrides.paymentStatus !== undefined) {
      if (overrides.paymentStatus) params.set("paymentStatus", overrides.paymentStatus);
      else params.delete("paymentStatus");
    }
    const q = params.toString();
    return q ? `${pathname}?${q}` : pathname;
  };

  const handleOrderStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(buildUrl({ orderStatus: e.target.value || undefined }));
  };
  const handlePaymentStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(buildUrl({ paymentStatus: e.target.value || undefined }));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-gray-deep/70">Order status:</span>
      <select
        value={orderStatus ?? ""}
        onChange={handleOrderStatusChange}
        className="rounded-full border border-gray-soft bg-white px-3 py-1.5 text-gray-deep/90"
        aria-label="Filter by order status"
      >
        <option value="">All</option>
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <span className="ml-2 text-gray-deep/70">Payment:</span>
      <select
        value={paymentStatus ?? ""}
        onChange={handlePaymentStatusChange}
        className="rounded-full border border-gray-soft bg-white px-3 py-1.5 text-gray-deep/90"
        aria-label="Filter by payment status"
      >
        <option value="">All</option>
        {PAYMENT_STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
