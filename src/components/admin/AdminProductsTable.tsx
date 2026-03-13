"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORY_OPTIONS, categoryLabel } from "@/lib/categories";

type ProductRow = {
  id: string;
  title: string;
  brand: string;
  price: number;
  categories: string[];
  createdAt: string;
};

type Props = { products: ProductRow[] };

export function AdminProductsTable({ products }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [bulkMode, setBulkMode] = useState<"brand" | "categories" | null>(null);
  const [brandValue, setBrandValue] = useState("");
  const [categoriesValue, setCategoriesValue] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.id)));
  };

  const openBulkBrand = () => {
    setBulkMode("brand");
    setBrandValue("");
  };
  const openBulkCategories = () => {
    setBulkMode("categories");
    setCategoriesValue([]);
  };
  const closeBulk = () => {
    setBulkMode(null);
    setBrandValue("");
    setCategoriesValue([]);
  };

  const runBulk = async () => {
    if (selected.size === 0) return;
    setLoading(true);
    try {
      const body =
        bulkMode === "brand"
          ? { ids: Array.from(selected), brand: brandValue.trim() }
          : {
              ids: Array.from(selected),
              categories: categoriesValue.length > 0 ? categoriesValue : [],
            };
      const res = await fetch("/api/admin/products/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setSelected(new Set());
        closeBulk();
        router.refresh();
      } else {
        alert(data.error ?? "Update failed");
      }
    } catch {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (c: string) => {
    setCategoriesValue((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  return (
    <div className="space-y-4">
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-soft bg-gray-soft/30 px-4 py-2">
          <span className="text-sm font-medium text-gray-deep/90">
            {selected.size} selected
          </span>
          {!bulkMode ? (
            <>
              <button
                type="button"
                onClick={openBulkBrand}
                className="rounded border border-gray-deep/40 bg-white px-3 py-1.5 text-xs font-medium text-gray-deep hover:bg-gray-soft/50"
              >
                Update brand
              </button>
              <button
                type="button"
                onClick={openBulkCategories}
                className="rounded border border-gray-deep/40 bg-white px-3 py-1.5 text-xs font-medium text-gray-deep hover:bg-gray-soft/50"
              >
                Update categories
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="text-xs text-gray-deep/80 hover:underline"
              >
                Clear
              </button>
            </>
          ) : bulkMode === "brand" ? (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={brandValue}
                onChange={(e) => setBrandValue(e.target.value)}
                placeholder="New brand name"
                className="rounded border border-gray-soft px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                disabled={loading || !brandValue.trim()}
                onClick={runBulk}
                className="rounded bg-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-ink/90 disabled:opacity-50"
              >
                Apply
              </button>
              <button type="button" onClick={closeBulk} className="text-xs text-gray-deep/80 hover:underline">
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap gap-1">
                {CATEGORY_OPTIONS.map((c) => (
                  <label key={c} className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={categoriesValue.includes(c)}
                      onChange={() => toggleCategory(c)}
                      className="rounded border-gray-deep/40"
                    />
                    {categoryLabel(c)}
                  </label>
                ))}
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={runBulk}
                className="rounded bg-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-ink/90 disabled:opacity-50"
              >
                Apply
              </button>
              <button type="button" onClick={closeBulk} className="text-xs text-gray-deep/80 hover:underline">
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-gray-soft bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-soft bg-gray-soft/40 text-xs uppercase tracking-[0.18em] text-gray-deep/70">
            <tr>
              <th className="w-10 px-2 py-3">
                <input
                  type="checkbox"
                  checked={products.length > 0 && selected.size === products.length}
                  onChange={toggleAll}
                  aria-label="Select all"
                  className="rounded border-gray-deep/40"
                />
              </th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Categories</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-gray-soft/70">
                <td className="w-10 px-2 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                    aria-label={`Select ${p.title}`}
                    className="rounded border-gray-deep/40"
                  />
                </td>
                <td className="px-4 py-3 text-gray-deep/90">{p.title}</td>
                <td className="px-4 py-3 text-gray-deep/80">{p.brand}</td>
                <td className="px-4 py-3 text-xs text-gray-deep/70">
                  {p.categories.map(categoryLabel).join(", ") || "—"}
                </td>
                <td className="px-4 py-3">₹{(p.price / 100).toFixed(0)}</td>
                <td className="px-4 py-3 text-xs text-gray-deep/70">
                  {p.createdAt.slice(0, 10)}
                </td>
                <td className="px-4 py-3 text-right text-xs">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-gray-deep/80 hover:text-black"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-sm text-gray-deep/70"
                >
                  No products yet. Create your first product.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
