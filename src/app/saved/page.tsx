"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  getWishlistIds,
  fetchServerWishlistIds,
  mergeLocalWishlistToServer,
} from "@/lib/wishlist";
import { ProductGrid } from "@/components/product/ProductGrid";

type ProductFromApi = {
  id: string;
  title: string;
  slug: string;
  brand: string;
  price: number;
  comparePrice: number | null;
  description: string;
  categories: string[];
  createdAt: string;
  variants: Array<{
    id: string;
    size: string;
    color: string | null;
    price: number;
    inventory: { stockQuantity: number } | null;
  }>;
  images: Array<{ url: string; alt: string | null; position: number }>;
};

async function fetchProductsByIds(ids: string[]): Promise<ProductFromApi[]> {
  if (ids.length === 0) return [];
  const params = new URLSearchParams({ ids: ids.join(",") });
  const res = await fetch(`/api/products?${params}`);
  const data = await res.json().catch(() => ({}));
  const list = data?.data ?? [];
  const byId = new Map(list.map((p: ProductFromApi) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as ProductFromApi[];
}

export default function SavedPage() {
  const [products, setProducts] = useState<ProductFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const loadWishlist = useCallback(async () => {
    const sessionRes = await fetch("/api/auth/session", { credentials: "include" });
    const session = await sessionRes.json().catch(() => ({}));
    const user = session?.user ?? null;
    setIsLoggedIn(!!user);

    let ids: string[];
    if (user) {
      const localIds = getWishlistIds();
      if (localIds.length > 0) {
        await mergeLocalWishlistToServer();
      }
      ids = await fetchServerWishlistIds();
    } else {
      ids = getWishlistIds();
    }

    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    try {
      const ordered = await fetchProductsByIds(ids);
      setProducts(ordered);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  useEffect(() => {
    const handler = () => loadWishlist();
    window.addEventListener("verlano-wishlist-change", handler);
    return () => window.removeEventListener("verlano-wishlist-change", handler);
  }, [loadWishlist]);

  return (
    <main className="flex flex-1 flex-col py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Saved for later</h1>
      <p className="mt-2 text-sm text-gray-deep/80">
        {isLoggedIn
          ? "Products you’ve saved. When you’re signed in, your list is synced across devices."
          : "Products you’ve saved. Sign in to sync your list across devices."}
      </p>

      {loading ? (
        <div className="mt-8 grid animate-pulse gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[4/5] rounded-2xl bg-gray-soft/50" />
              <div className="h-3 w-3/4 rounded bg-gray-soft/40" />
              <div className="h-4 w-1/2 rounded bg-gray-soft/40" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-gray-soft bg-white px-6 py-16 text-center">
          <p className="text-sm font-medium text-gray-deep/90">No saved products yet.</p>
          <p className="mt-2 text-xs text-gray-deep/70">
            Use “Save for later” on a product page to add it here.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-block rounded-full border border-ink bg-ink px-6 py-2 text-xs font-medium text-white transition hover:bg-ink/90"
          >
            Browse shop
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <ProductGrid products={products as unknown as Parameters<typeof ProductGrid>[0]["products"]} />
        </div>
      )}
    </main>
  );
}
