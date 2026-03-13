"use client";

import Link from "next/link";
import type { CartItemDto } from "@/types/cart";

type CartItemProps = {
  item: CartItemDto;
  onQuantityChange: (cartItemId: string, quantity: number) => void;
  onRemove: (cartItemId: string) => void;
};

export function CartItem({
  item,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const subtotal = item.price * item.quantity;

  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-soft py-4 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-gray-deep/80">
          {item.productBrand}
        </p>
        <Link
          href={`/product/${item.productSlug}`}
          className="mt-0.5 block text-sm font-medium text-black hover:underline"
        >
          {item.productTitle}
        </Link>
        <p className="mt-1 text-xs text-gray-deep/80">
          {item.color?.trim()
            ? `Size: ${item.size} · Colour: ${item.color.trim()}`
            : `Size: ${item.size}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Decrease quantity"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-soft text-sm font-medium text-black hover:bg-gray-soft/50"
            onClick={() =>
              onQuantityChange(item.id, Math.max(0, item.quantity - 1))
            }
          >
            −
          </button>
          <span className="w-6 text-center text-sm font-medium">
            {item.quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-soft text-sm font-medium text-black hover:bg-gray-soft/50"
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
          >
            +
          </button>
        </div>
        <span className="w-16 text-right text-sm font-medium">
          ₹{(subtotal / 100).toFixed(0)}
        </span>
        <button
          type="button"
          aria-label="Remove item"
          className="text-xs text-gray-deep/80 underline hover:text-black"
          onClick={() => onRemove(item.id)}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
