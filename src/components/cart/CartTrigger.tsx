"use client";

import { useCart } from "@/contexts/CartContext";

export function CartTrigger() {
  const { openCart, cartCount } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      className="cursor-pointer text-sm font-medium hover:opacity-80"
    >
      Cart {cartCount > 0 ? `(${cartCount})` : ""}
    </button>
  );
}
