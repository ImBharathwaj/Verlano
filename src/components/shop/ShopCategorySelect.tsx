"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CATEGORY_OPTIONS, categoryLabel } from "@/lib/categories";

type Props = {
  currentCategory?: string;
};

export function ShopCategorySelect({ currentCategory }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const normalized = currentCategory?.trim().toLowerCase();
  const matchedCategory =
    normalized && CATEGORY_OPTIONS.some((c) => c.toLowerCase() === normalized)
      ? CATEGORY_OPTIONS.find((c) => c.toLowerCase() === normalized) ?? ""
      : "";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (value?.trim()) {
      params.set("category", value.trim());
      params.delete("page");
    } else {
      params.delete("category");
      params.delete("page");
    }
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-gray-deep/70">
        Category
      </span>
      <div className="relative">
        <select
          value={matchedCategory}
          onChange={(e) => handleChange(e.target.value)}
          className="h-9 min-w-[140px] appearance-none rounded-full border border-gray-soft bg-white px-4 pr-8 text-xs text-ink focus:border-ink focus:outline-none"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {categoryLabel(cat)}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-deep/60">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
    </div>
  );
}
