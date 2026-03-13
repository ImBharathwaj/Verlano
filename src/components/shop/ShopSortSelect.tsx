"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

type Props = {
  currentSort: string;
  category?: string;
};

export function ShopSortSelect({ currentSort, category }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (value && value !== "latest") params.set("sort", value);
    else params.delete("sort");
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-soft bg-white px-4 py-3 text-xs text-gray-deep/80">
      <div className="flex items-center gap-2">
        <span className="uppercase tracking-[0.18em] text-gray-deep/70">
          Sort
        </span>
        <select
          value={currentSort}
          onChange={(e) => handleChange(e.target.value)}
          className="h-8 rounded-full border border-gray-soft bg-white px-3 text-xs text-gray-deep/90"
          aria-label="Sort products"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
