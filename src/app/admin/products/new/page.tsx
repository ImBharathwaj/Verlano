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
