"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  position: number;
};

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  brand: string;
  price: number;
  comparePrice: number | null;
  images: ProductImage[];
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
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!product) return;
      const value =
        field === "price" || field === "comparePrice"
          ? Number(e.target.value) * 100
          : e.target.value;
      setProduct({ ...product, [field]: value as never });
    };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
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
