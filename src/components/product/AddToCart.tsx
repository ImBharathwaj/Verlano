"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

type VariantOption = {
  id: string;
  size: string;
  stock: number;
};

type AddToCartProps = {
  variants: VariantOption[];
};

export function AddToCart({ variants }: AddToCartProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants[0]?.id ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const { openCart, refreshCart } = useCart();

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const canAdd =
    selectedVariant &&
    selectedVariant.stock >= quantity &&
    quantity >= 1;

  const handleAdd = async () => {
    if (!selectedVariantId || !canAdd) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: selectedVariantId, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        return;
      }
      await refreshCart();
      setStatus("done");
      openCart();
    } catch {
      setStatus("error");
    }
  };

  if (variants.length === 0) {
    return (
      <button
        type="button"
        disabled
        className="rounded-full border border-gray-soft px-6 py-2 text-sm font-medium text-gray-deep/60"
      >
        Sold out
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-deep/70">
          Size
        </p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedVariantId(v.id)}
              disabled={v.stock === 0}
              className={`min-w-[40px] rounded-full border px-3 py-1 text-xs font-medium ${
                selectedVariantId === v.id
                  ? "border-black bg-black text-white"
                  : "border-gray-soft text-black hover:border-black/60"
              } ${v.stock === 0 ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {v.size}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-soft text-sm font-medium hover:bg-gray-soft/50"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() =>
              setQuantity((q) =>
                Math.min(selectedVariant?.stock ?? 1, q + 1),
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-soft text-sm font-medium hover:bg-gray-soft/50"
          >
            +
          </button>
        </div>
        <button
          type="button"
          disabled={!canAdd || status === "loading"}
          onClick={handleAdd}
          className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading"
            ? "Adding…"
            : status === "done"
              ? "Added"
              : "Add to cart"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-xs text-red-600">Could not add to cart. Try again.</p>
      )}
    </div>
  );
}
