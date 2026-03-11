"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminNewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    brand: "",
    price: "",
    comparePrice: "",
    size: "",
    variantPrice: "",
    stockQuantity: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          description: form.description,
          brand: form.brand,
          price: Number(form.price) * 100,
          comparePrice: form.comparePrice
            ? Number(form.comparePrice) * 100
            : null,
          variants:
            form.size && form.variantPrice && form.stockQuantity
              ? [
                  {
                    size: form.size,
                    price: Number(form.variantPrice) * 100,
                    stockQuantity: Number(form.stockQuantity),
                  },
                ]
              : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create product");
      } else {
        router.push("/admin/products");
      }
    } catch {
      setError("Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
    };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New product</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-gray-soft bg-white px-6 py-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-deep/80">
              Title
            </label>
            <input
              className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
              value={form.title}
              onChange={update("title")}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-deep/80">
              Slug
            </label>
            <input
              className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
              value={form.slug}
              onChange={update("slug")}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-deep/80">
              Brand
            </label>
            <input
              className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
              value={form.brand}
              onChange={update("brand")}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-deep/80">
              Base price (₹)
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
              value={form.price}
              onChange={update("price")}
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
              value={form.comparePrice}
              onChange={update("comparePrice")}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-deep/80">
            Description
          </label>
          <textarea
            className="min-h-[80px] w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
            value={form.description}
            onChange={update("description")}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-deep/80">
              Size
            </label>
            <input
              className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
              value={form.size}
              onChange={update("size")}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-deep/80">
              Variant price (₹)
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
              value={form.variantPrice}
              onChange={update("variantPrice")}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-deep/80">
              Stock quantity
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
              value={form.stockQuantity}
              onChange={update("stockQuantity")}
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create product"}
        </button>
      </form>
    </div>
  );
}
