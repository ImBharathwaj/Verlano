"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CATEGORY_OPTIONS, categoryLabel } from "@/lib/categories";

type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  position: number;
};

type ProductVariant = {
  id: string;
  size: string;
  color: string | null;
  price: number;
  inventory: { stockQuantity: number } | null;
};

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  brand: string;
  categories: string[];
  price: number;
  comparePrice: number | null;
  images: ProductImage[];
  variants?: ProductVariant[];
};

export default function AdminEditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to load product");
        } else {
          setProduct(data);
        }
      } catch {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const handleChange = (field: keyof Product) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      if (!product) return;
      const value =
        field === "price" || field === "comparePrice"
          ? Number(e.target.value) * 100
          : e.target.value;
      setProduct({ ...product, [field]: value as never });
    };

  const toggleCategory = (cat: string) => {
    if (!product) return;
    const next = product.categories.includes(cat)
      ? product.categories.filter((c) => c !== cat)
      : [...product.categories, cat];
    setProduct({ ...product, categories: next });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSaving(true);
    setError(null);
    try {
      const variantsPayload = (product.variants ?? []).map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        price: v.price,
        stockQuantity: v.inventory?.stockQuantity ?? 0,
      }));
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          variants: variantsPayload,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update product");
      } else {
        router.push("/admin/products");
      }
    } catch {
      setError("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to delete product");
      } else {
        router.push("/admin/products");
      }
    } catch {
      setError("Failed to delete product");
    }
  };

  if (loading) {
    return <p className="py-12 text-sm text-gray-deep/80">Loading...</p>;
  }

  if (!product) {
    return <p className="py-12 text-sm text-red-600">Product not found.</p>;
  }

  const priceDisplay = (product.price / 100).toString();
  const compareDisplay = product.comparePrice
    ? (product.comparePrice / 100).toString()
    : "";

  const images = product.images ?? [];
  const variants = product.variants ?? [];

  const updateVariant = (index: number, field: keyof ProductVariant | "stockQuantity", value: string | number) => {
    if (!product) return;
    const list = product.variants ?? [];
    const next = list.map((v, i) => {
      if (i !== index) return v;
      if (field === "stockQuantity") {
        return { ...v, inventory: { stockQuantity: Number(value) || 0 } };
      }
      return { ...v, [field]: value };
    });
    setProduct({ ...product, variants: next });
  };

  const addVariant = () => {
    if (!product) return;
    setProduct({
      ...product,
      variants: [
        ...(product.variants ?? []),
        {
          id: "",
          size: "",
          color: null,
          price: 0,
          inventory: { stockQuantity: 0 },
        } as ProductVariant,
      ],
    });
  };

  const removeVariant = (index: number) => {
    if (!product) return;
    setProduct({
      ...product,
      variants: (product.variants ?? []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Edit product</h1>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-full border border-red-500 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-2xl border border-gray-soft bg-white px-6 py-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-deep/80">
              Title
            </label>
            <input
              className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
              value={product.title}
              onChange={handleChange("title")}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-deep/80">
              Slug
            </label>
            <input
              className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
              value={product.slug}
              onChange={handleChange("slug")}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-deep/80">
              Brand
            </label>
            <input
              className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
              value={product.brand}
              onChange={handleChange("brand")}
              required
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-gray-deep/80">
              Categories
            </p>
            <div className="flex flex-wrap gap-3">
              {CATEGORY_OPTIONS.map((cat) => {
                const checked = (product.categories ?? []).includes(cat);
                return (
                  <label
                    key={cat}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-soft bg-white px-3 py-1.5 text-sm transition-colors hover:border-gray-deep/50 has-[:checked]:border-ink has-[:checked]:bg-ink/5"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(cat)}
                      className="rounded border-gray-deep/40 text-ink"
                    />
                    <span>{categoryLabel(cat)}</span>
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-gray-deep/70">
              Select one or more; product appears when any selected category is chosen.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-deep/80">
              Base price (₹)
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
              value={priceDisplay}
              onChange={(e) => {
                const n = Number(e.target.value) || 0;
                setProduct({ ...product, price: n * 100 });
              }}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-deep/80">
              Compare at price (₹)
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
              value={compareDisplay}
              onChange={(e) => {
                const v = e.target.value;
                const n = Number(v);
                setProduct({
                  ...product,
                  comparePrice: v ? n * 100 : null,
                });
              }}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-deep/80">
            Description
          </label>
          <textarea
            className="min-h-[80px] w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
            value={product.description}
            onChange={handleChange("description")}
            required
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-deep/70">
            Product images
          </p>
          <ul className="space-y-2">
            {images.length === 0 && (
              <li className="text-xs text-gray-deep/70">
                No images stored yet. You can paste URLs and alt text here and
                mark one as primary.
              </li>
            )}
            {images.map((img, index) => (
              <li
                key={img.id ?? index}
                className="flex items-center gap-2 rounded-lg border border-gray-soft bg-white px-3 py-2"
              >
                <span className="text-[11px] text-gray-deep/70">
                  {index + 1}.
                </span>
                <input
                  className="flex-1 truncate text-xs text-gray-deep/80"
                  value={img.url}
                  onChange={(e) => {
                    const val = e.target.value;
                    const next = images.map((p, i) =>
                      i === index ? { ...p, url: val } : p,
                    );
                    setProduct({ ...product, images: next });
                  }}
                  placeholder="https://..."
                />
                <input
                  className="w-40 rounded border border-gray-soft px-2 py-1 text-xs text-black"
                  placeholder="Alt text"
                  value={img.alt ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const next = images.map((p, i) =>
                      i === index ? { ...p, alt: val } : p,
                    );
                    setProduct({ ...product, images: next });
                  }}
                />
                <label className="flex items-center gap-1 text-[11px] text-gray-deep/80">
                  <input
                    type="radio"
                    name="primaryImage"
                    checked={img.isPrimary}
                    onChange={() => {
                      const next = images.map((p, i) => ({
                        ...p,
                        isPrimary: i === index,
                      }));
                      setProduct({ ...product, images: next });
                    }}
                  />
                  Primary
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-deep/70">
              Variants (size & color)
            </p>
            <button
              type="button"
              onClick={addVariant}
              className="rounded-full border border-gray-soft bg-white px-3 py-1.5 text-xs font-medium text-gray-deep/80 hover:border-gray-deep"
            >
              + Add variant
            </button>
          </div>
          {variants.length === 0 ? (
            <p className="text-xs text-gray-deep/70">
              No variants yet. Add size, optional color, price, and stock.
            </p>
          ) : (
            <ul className="space-y-3">
              {variants.map((v, index) => (
                <li
                  key={v.id || `new-${index}`}
                  className="grid gap-3 rounded-lg border border-gray-soft bg-gray-soft/20 p-3 sm:grid-cols-2 lg:grid-cols-[1fr,1fr,1fr,1fr,auto]"
                >
                  <div>
                    <label className="mb-0.5 block text-[11px] font-medium text-gray-deep/70">
                      Size
                    </label>
                    <input
                      className="w-full rounded border border-gray-soft bg-white px-2 py-1.5 text-sm text-black"
                      value={v.size}
                      onChange={(e) => updateVariant(index, "size", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[11px] font-medium text-gray-deep/70">
                      Color (optional)
                    </label>
                    <input
                      className="w-full rounded border border-gray-soft bg-white px-2 py-1.5 text-sm text-black"
                      value={v.color ?? ""}
                      onChange={(e) => updateVariant(index, "color", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[11px] font-medium text-gray-deep/70">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-full rounded border border-gray-soft bg-white px-2 py-1.5 text-sm text-black"
                      value={v.price ? (v.price / 100).toString() : ""}
                      onChange={(e) =>
                        updateVariant(index, "price", Math.round(Number(e.target.value) * 100) || 0)
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[11px] font-medium text-gray-deep/70">
                      Stock
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-full rounded border border-gray-soft bg-white px-2 py-1.5 text-sm text-black"
                      value={v.inventory?.stockQuantity ?? ""}
                      onChange={(e) =>
                        updateVariant(index, "stockQuantity", Number(e.target.value) || 0)
                      }
                    />
                  </div>
                  {!v.id && (
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="rounded border border-red-200 bg-white px-2 py-1.5 text-xs text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
