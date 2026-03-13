"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const SIZE_OPTIONS = ["S", "M", "L", "XL"];

const PRICE_OPTIONS = [
  { value: "under-1000", label: "Under ₹1000", min: 0, max: 99900 },
  { value: "1000-2000", label: "₹1000 – ₹2000", min: 100000, max: 199900 },
  { value: "2000-plus", label: "₹2000+", min: 200000, max: undefined },
] as const;

const AVAILABILITY_OPTIONS = [
  { value: "in-stock", label: "In stock" },
  { value: "sold-out", label: "Sold out" },
] as const;

type Props = {
  currentSize?: string;
  currentPrice?: string;
  currentAvailability?: string;
  currentBrand?: string;
  brands?: string[];
};

export function ShopFilters({ currentSize, currentPrice, currentAvailability, currentBrand, brands = [] }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 text-xs">
      <div className="flex items-center gap-2">
        <span className="uppercase tracking-[0.18em] text-gray-deep/70">Size</span>
        <select
          value={currentSize ?? ""}
          onChange={(e) => updateParams("size", e.target.value || null)}
          className="h-8 min-w-[72px] rounded-full border border-gray-soft bg-white px-3 text-gray-deep/90 focus:outline-none focus:ring-1 focus:ring-ink"
          aria-label="Filter by size"
        >
          <option value="">All</option>
          {SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="uppercase tracking-[0.18em] text-gray-deep/70">Price</span>
        <select
          value={currentPrice ?? ""}
          onChange={(e) => updateParams("price", e.target.value || null)}
          className="h-8 min-w-[120px] rounded-full border border-gray-soft bg-white px-3 text-gray-deep/90 focus:outline-none focus:ring-1 focus:ring-ink"
          aria-label="Filter by price"
        >
          <option value="">All</option>
          {PRICE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="uppercase tracking-[0.18em] text-gray-deep/70">Availability</span>
        <select
          value={currentAvailability ?? ""}
          onChange={(e) => updateParams("availability", e.target.value || null)}
          className="h-8 min-w-[100px] rounded-full border border-gray-soft bg-white px-3 text-gray-deep/90 focus:outline-none focus:ring-1 focus:ring-ink"
          aria-label="Filter by availability"
        >
          <option value="">All</option>
          {AVAILABILITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {brands.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-[0.18em] text-gray-deep/70">Brand</span>
          <select
            value={currentBrand ?? ""}
            onChange={(e) => updateParams("brand", e.target.value || null)}
            className="h-8 min-w-[100px] rounded-full border border-gray-soft bg-white px-3 text-gray-deep/90 focus:outline-none focus:ring-1 focus:ring-ink"
            aria-label="Filter by brand"
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
