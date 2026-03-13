"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_OPTIONS } from "@/lib/categories";

type VariantRow = { sizes: string; colors: string; price: string; stockQuantity: string };

export default function AdminNewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    brand: "",
    categories: [] as string[],
    price: "",
    comparePrice: "",
    variants: [] as VariantRow[],
  });
  const [images, setImages] = useState<
    { url: string; alt: string; isPrimary: boolean; position: number }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

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
          description: form.description,
          brand: form.brand,
          categories: form.categories,
          price: Number(form.price) * 100,
          comparePrice: form.comparePrice
            ? Number(form.comparePrice) * 100
            : null,
          variants: form.variants.flatMap((v) => {
            const sizes = v.sizes
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            const colors = v.colors
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean);
            const price = Number(v.price) * 100;
            const stock = Number(v.stockQuantity) || 0;
            if (!sizes.length || !v.price.trim()) return [];
            if (colors.length === 0) {
              return sizes.map((size) => ({
                size,
                color: null,
                price,
                stockQuantity: stock,
              }));
            }
            const result: { size: string; color: string | null; price: number; stockQuantity: number }[] = [];
            for (const size of sizes) {
              for (const color of colors) {
                result.push({ size, color, price, stockQuantity: stock });
              }
            }
            return result;
          }),
          images: images,
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

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded: { url: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/uploads/product-image", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Failed to upload image");
        }
        if (data.url) {
          uploaded.push({ url: data.url as string });
        }
      }

      setImages((prev) => {
        const base = [...prev];
        uploaded.forEach(({ url }) => {
          base.push({
            url,
            alt: "",
            isPrimary: base.length === 0, // first image becomes primary
            position: base.length,
          });
        });
        return base;
      });
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
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
            <p className="mb-2 text-xs font-medium text-gray-deep/80">
              Categories
            </p>
            <div className="flex flex-wrap gap-3">
              {CATEGORY_OPTIONS.map((cat) => {
                const checked = form.categories.includes(cat);
                return (
                  <label
                    key={cat}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-soft bg-white px-3 py-1.5 text-sm transition-colors hover:border-gray-deep/50 has-[:checked]:border-ink has-[:checked]:bg-ink/5"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setForm((f) => ({
                          ...f,
                          categories: checked
                            ? f.categories.filter((c) => c !== cat)
                            : [...f.categories, cat],
                        }));
                      }}
                      className="rounded border-gray-deep/40 text-ink"
                    />
                    <span className="capitalize">{cat}</span>
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-gray-deep/70">
              Select one or more; product appears in shop when any selected category is chosen.
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
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-deep/70">
            Product images
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="mb-1 block text-xs font-medium text-gray-deep/80">
                Upload images (stored in MinIO)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="block w-full text-xs text-gray-deep/80 file:mr-3 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-white file:hover:bg-black/90"
              />
              {uploading && (
                <p className="text-xs text-gray-deep/70">Uploading...</p>
              )}
            </div>
            <div className="space-y-2">
              {images.length === 0 ? (
                <p className="text-xs text-gray-deep/70">
                  No images yet. Upload 1–5 images; the first becomes primary.
                </p>
              ) : (
                <ul className="space-y-2">
                  {images.map((img, index) => (
                    <li
                      key={img.url + index}
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
                          setImages((prev) =>
                            prev.map((p, i) =>
                              i === index ? { ...p, url: val } : p,
                            ),
                          );
                        }}
                      />
                      <input
                        className="w-40 rounded border border-gray-soft px-2 py-1 text-xs text-black"
                        placeholder="Alt text"
                        value={img.alt}
                        onChange={(e) => {
                          const val = e.target.value;
                          setImages((prev) =>
                            prev.map((p, i) =>
                              i === index ? { ...p, alt: val } : p,
                            ),
                          );
                        }}
                      />
                      <label className="flex items-center gap-1 text-[11px] text-gray-deep/80">
                        <input
                          type="radio"
                          name="primaryImage"
                          checked={img.isPrimary}
                          onChange={() =>
                            setImages((prev) =>
                              prev.map((p, i) => ({
                                ...p,
                                isPrimary: i === index,
                              })),
                            )
                          }
                        />
                        Primary
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-deep/70">
              Variants (size & color)
            </p>
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  variants: [
                    ...f.variants,
                    { sizes: "", colors: "", price: "", stockQuantity: "" },
                  ],
                }))
              }
              className="rounded-full border border-gray-soft bg-white px-3 py-1.5 text-xs font-medium text-gray-deep/80 hover:border-gray-deep"
            >
              + Add variant
            </button>
          </div>
          {form.variants.length === 0 ? (
            <p className="text-xs text-gray-deep/70">
              Add at least one variant. Enter sizes and colours separated by commas (e.g. S, M, L and Navy, White).
            </p>
          ) : (
            <ul className="space-y-3">
              {form.variants.map((v, index) => (
                <li
                  key={index}
                  className="grid gap-3 rounded-lg border border-gray-soft bg-gray-soft/20 p-3 sm:grid-cols-2 lg:grid-cols-[1fr,1fr,1fr,1fr,auto]"
                >
                  <div>
                    <label className="mb-0.5 block text-[11px] font-medium text-gray-deep/70">
                      Sizes (comma-separated)
                    </label>
                    <input
                      className="w-full rounded border border-gray-soft bg-white px-2 py-1.5 text-sm text-black"
                      placeholder="e.g. S, M, L, XL"
                      value={v.sizes}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm((f) => ({
                          ...f,
                          variants: f.variants.map((vv, i) =>
                            i === index ? { ...vv, sizes: val } : vv,
                          ),
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[11px] font-medium text-gray-deep/70">
                      Colours (comma-separated, optional)
                    </label>
                    <input
                      className="w-full rounded border border-gray-soft bg-white px-2 py-1.5 text-sm text-black"
                      placeholder="e.g. Navy, White, Black"
                      value={v.colors}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm((f) => ({
                          ...f,
                          variants: f.variants.map((vv, i) =>
                            i === index ? { ...vv, colors: val } : vv,
                          ),
                        }));
                      }}
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
                      value={v.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm((f) => ({
                          ...f,
                          variants: f.variants.map((vv, i) =>
                            i === index ? { ...vv, price: val } : vv,
                          ),
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[11px] font-medium text-gray-deep/70">
                      Stock (per size)
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-full rounded border border-gray-soft bg-white px-2 py-1.5 text-sm text-black"
                      value={v.stockQuantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm((f) => ({
                          ...f,
                          variants: f.variants.map((vv, i) =>
                            i === index
                              ? { ...vv, stockQuantity: val }
                              : vv,
                          ),
                        }));
                      }}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          variants: f.variants.filter((_, i) => i !== index),
                        }))
                      }
                      className="rounded border border-red-200 bg-white px-2 py-1.5 text-xs text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
