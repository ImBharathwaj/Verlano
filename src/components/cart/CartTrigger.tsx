"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export function CartTrigger() {
  const { openCart, cartCount } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      className="text-sm font-medium text-ivory/80 hover:text-ivory"
    >
      Cart {cartCount > 0 ? `(${cartCount})` : ""}
    </button>
  );
}
