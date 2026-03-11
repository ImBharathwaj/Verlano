"use client";

import { useEffect } from "react";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import type { CartResponse } from "@/types/cart";

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  cart: CartResponse | null;
  loading: boolean;
  refreshCart: () => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
};

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  loading,
  refreshCart,
  updateQuantity,
  removeItem,
}: CartDrawerProps) {
  useEffect(() => {
    if (isOpen) void refreshCart();
  }, [isOpen, refreshCart]);

  if (!isOpen) return null;

  const items = cart?.items ?? [];
  const total = cart?.total ?? 0;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-gray-soft bg-white shadow-lg"
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-gray-soft px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight">Cart</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-deep/80 hover:text-black"
            aria-label="Close cart"
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <p className="text-sm text-gray-deep/70">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-deep/70">Your cart is empty.</p>
          ) : (
            <ul className="divide-y divide-gray-soft">
              {items.map((item) => (
                <li key={item.id}>
                  <CartItem
                    item={item}
                    onQuantityChange={(id, qty) => updateQuantity(id, qty)}
                    onRemove={removeItem}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
        {!loading && items.length > 0 && (
          <div className="border-t border-gray-soft px-6 py-4">
            <CartSummary
              total={total}
              itemCount={items.reduce((s, i) => s + i.quantity, 0)}
              onClose={onClose}
            />
          </div>
        )}
      </div>
    </>
  );
}
