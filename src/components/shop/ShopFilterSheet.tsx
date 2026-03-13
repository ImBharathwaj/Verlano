"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ShopFilters } from "./ShopFilters";

type Props = {
  currentSize?: string;
  currentPrice?: string;
  currentAvailability?: string;
  currentBrand?: string;
  brands?: string[];
  activeFilterCount: number;
};

export function ShopFilterSheet({
  currentSize,
  currentPrice,
  currentAvailability,
  currentBrand,
  brands = [],
  activeFilterCount,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsOpen(false);
  }, [searchParams?.toString()]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-full border border-gray-soft bg-white px-4 py-2 text-xs font-medium text-gray-deep/90 hover:border-gray-deep lg:hidden"
        aria-label="Open filters"
      >
        Filters
        {activeFilterCount > 0 && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-ink px-1.5 text-[10px] font-semibold text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            aria-hidden
            onClick={() => setIsOpen(false)}
          />
          <div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-hidden rounded-t-2xl border-t border-gray-soft bg-white shadow-xl lg:hidden"
            role="dialog"
            aria-label="Filters"
          >
            <div className="flex items-center justify-between border-b border-gray-soft px-6 py-4">
              <h2 className="text-base font-semibold tracking-tight">Filters</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-deep/80 hover:text-black"
                aria-label="Close filters"
              >
                Done
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-6">
              <ShopFilters
                currentSize={currentSize}
                currentPrice={currentPrice}
                currentAvailability={currentAvailability}
                currentBrand={currentBrand}
                brands={brands}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
