"use client";

import Link from "next/link";

type CartSummaryProps = {
  total: number;
  itemCount: number;
  onClose?: () => void;
};

export function CartSummary({
  total,
  itemCount,
  onClose,
}: CartSummaryProps) {
  return (
    <div className="border-t border-gray-soft pt-4">
      <div className="flex items-center justify-between text-sm">
        <span className="uppercase tracking-[0.15em] text-gray-deep/80">
          Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})
        </span>
        <span className="font-semibold">₹{(total / 100).toFixed(0)}</span>
      </div>
      <p className="mt-2 text-xs text-gray-deep/60">
        Shipping and taxes calculated at checkout.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <Link
          href="/cart"
          onClick={onClose}
          className="block rounded-full border border-black bg-white py-2.5 text-center text-sm font-medium text-black transition hover:bg-gray-soft/50"
        >
          View cart
        </Link>
        <Link
          href="/checkout"
          onClick={onClose}
          className="block rounded-full bg-black py-2.5 text-center text-sm font-medium text-white transition hover:bg-black/90"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
