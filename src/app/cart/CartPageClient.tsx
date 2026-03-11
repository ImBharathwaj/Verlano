"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import type { CartResponse } from "@/types/cart";

export function CartPageClient() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    const res = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId, quantity }),
    });
    if (res.ok) await refresh();
  };

  const removeItem = async (cartItemId: string) => {
    const res = await fetch(
      `/api/cart?cartItemId=${encodeURIComponent(cartItemId)}`,
      { method: "DELETE" },
    );
    if (res.ok) await refresh();
  };

  const items = cart?.items ?? [];
  const total = cart?.total ?? 0;

  if (loading) {
    return (
      <main className="flex flex-1 flex-col py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Your cart</h1>
        <p className="mt-4 text-sm text-gray-deep/70">Loading...</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex flex-1 flex-col py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Your cart</h1>
        <p className="mt-2 text-sm text-gray-deep/80">
          Review items before you proceed to checkout.
        </p>
        <div className="mt-8 rounded-2xl border border-gray-soft bg-white px-8 py-12 text-center">
          <p className="text-sm text-gray-deep/70">Your cart is empty.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-black/90"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Your cart</h1>
      <p className="mt-2 text-sm text-gray-deep/80">
        Review items before you proceed to checkout.
      </p>
      <div className="mt-8 grid gap-10 md:grid-cols-[1fr,340px]">
        <div className="rounded-2xl border border-gray-soft bg-white px-6 py-4">
          <ul className="divide-y divide-gray-soft">
            {items.map((item) => (
              <li key={item.id}>
                <CartItem
                  item={item}
                  onQuantityChange={updateQuantity}
                  onRemove={removeItem}
                />
              </li>
            ))}
          </ul>
        </div>
        <div className="h-fit rounded-2xl border border-gray-soft bg-white px-6 py-4">
          <CartSummary
            total={total}
            itemCount={items.reduce((s, i) => s + i.quantity, 0)}
          />
        </div>
      </div>
    </main>
  );
}
