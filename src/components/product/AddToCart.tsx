"use client";

import { useState, useMemo, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";

type VariantOption = {
  id: string;
  size: string;
  color: string | null;
  stock: number;
};

type AddToCartProps = {
  variants: VariantOption[];
};

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"];

function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.toUpperCase());
    const bi = SIZE_ORDER.indexOf(b.toUpperCase());
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    const an = parseInt(a, 10);
    const bn = parseInt(b, 10);
    if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
    return a.localeCompare(b);
  });
}

const NO_COLOR_LABEL = "—";

export function AddToCart({ variants }: AddToCartProps) {
  const uniqueSizes = useMemo(
    () => sortSizes([...new Set(variants.map((v) => v.size.trim()).filter(Boolean))]),
    [variants],
  );
  const colorOptions = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((v) => {
      const c = v.color?.trim() ?? "";
      set.add(c || NO_COLOR_LABEL);
    });
    const list = [...set];
    if (list.includes(NO_COLOR_LABEL)) {
      return [NO_COLOR_LABEL, ...list.filter((c) => c !== NO_COLOR_LABEL).sort()];
    }
    return list.sort();
  }, [variants]);

  const hasColorRow = colorOptions.length > 0;

  const [selectedSize, setSelectedSize] = useState<string>(uniqueSizes[0] ?? "");
  const [selectedColor, setSelectedColor] = useState<string>(
    colorOptions[0] ?? NO_COLOR_LABEL,
  );
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const { openCart, refreshCart } = useCart();

  const selectedVariant = useMemo(
    () =>
      variants.find(
        (v) =>
          v.size === selectedSize &&
          (v.color?.trim() ?? "") === (selectedColor === NO_COLOR_LABEL ? "" : selectedColor),
      ) ?? null,
    [variants, selectedSize, selectedColor],
  );

  useEffect(() => {
    if (selectedVariant) return;
    const firstWithStock = colorOptions.find((color) => {
      const colorValue = color === NO_COLOR_LABEL ? "" : color;
      const v = variants.find(
        (x) =>
          x.size === selectedSize &&
          (x.color?.trim() ?? "") === colorValue &&
          x.stock > 0,
      );
      return !!v;
    });
    if (firstWithStock !== undefined) setSelectedColor(firstWithStock);
  }, [selectedSize, colorOptions, variants]);
  const canAdd =
    selectedVariant &&
    selectedVariant.stock >= quantity &&
    quantity >= 1;

  const handleAdd = async () => {
    if (!selectedVariant?.id || !canAdd) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: selectedVariant.id, quantity }),
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

  const stockForSize = (size: string) =>
    variants.filter((v) => v.size === size).reduce((s, v) => s + v.stock, 0);

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
          {uniqueSizes.map((size) => {
            const outOfStock = stockForSize(size) === 0;
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                disabled={outOfStock}
                className={`min-w-[40px] rounded-full border px-3 py-1 text-xs font-medium ${
                  isSelected
                    ? "border-black bg-black text-white"
                    : "border-gray-soft text-black hover:border-black/60"
                } ${outOfStock ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
      {hasColorRow && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-deep/70">
            Colour
          </p>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => {
              const colorValue = color === NO_COLOR_LABEL ? "" : color;
              const variantForSizeColor = variants.find(
                (v) =>
                  v.size === selectedSize &&
                  (v.color?.trim() ?? "") === colorValue,
              );
              const outOfStock = !variantForSizeColor || variantForSizeColor.stock === 0;
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  disabled={outOfStock}
                  className={`min-w-[40px] rounded-full border px-3 py-1 text-xs font-medium ${
                    isSelected
                      ? "border-black bg-black text-white"
                      : "border-gray-soft text-black hover:border-black/60"
                  } ${outOfStock ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {color === NO_COLOR_LABEL ? "One colour" : color}
                </button>
              );
            })}
          </div>
        </div>
      )}
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
