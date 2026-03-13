"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import type { CartResponse } from "@/types/cart";

type CartContextValue = {
  openCart: () => void;
  closeCart: () => void;
  cartCount: number;
  cart: CartResponse | null;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      const data = await res.json();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId, quantity }),
      });
      if (res.ok) await refreshCart();
    },
    [refreshCart],
  );

  const removeItem = useCallback(
    async (cartItemId: string) => {
      const res = await fetch(`/api/cart?cartItemId=${encodeURIComponent(cartItemId)}`, {
        method: "DELETE",
      });
      if (res.ok) await refreshCart();
    },
    [refreshCart],
  );

  const cartCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;

  const value: CartContextValue = {
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    cartCount,
    cart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        cart={cart}
        loading={loading}
        refreshCart={refreshCart}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
      />
    </CartContext.Provider>
  );
}
