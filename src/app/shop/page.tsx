import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ShopCategorySelect } from "@/components/shop/ShopCategorySelect";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ShopFilterSheet } from "@/components/shop/ShopFilterSheet";
import { ShopSortSelect } from "@/components/shop/ShopSortSelect";
import { CATEGORY_OPTIONS } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse our rotating edit of surplus pieces from premium labels. Curated in small runs, priced for everyday wardrobes.",
  openGraph: {
    title: "Shop | Verlano",
    description:
      "Browse our rotating edit of surplus pieces from premium labels. Curated in small runs, priced for everyday wardrobes.",
  },
};

const SORT_OPTIONS = [
  { value: "latest", label: "Latest", orderBy: { createdAt: "desc" as const } },
  { value: "price-asc", label: "Price: low to high", orderBy: { price: "asc" as const } },
  { value: "price-desc", label: "Price: high to low", orderBy: { price: "desc" as const } },
] as const;

const PAGE_SIZE = 24;

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function getOrderBy(sort?: string, filter?: string) {
  if (filter === "value") return { price: "asc" as const };
  const found = SORT_OPTIONS.find((o) => o.value === sort);
  return found?.orderBy ?? { createdAt: "desc" as const };
}

const PRICE_BANDS: Record<string, { min?: number; max?: number }> = {
  "under-1000": { min: 0, max: 99900 },
  "1000-2000": { min: 100000, max: 199900 },
  "2000-plus": { min: 200000, max: undefined },
};

async function getProducts(
  category?: string,
  sort?: string,
  q?: string,
  page = 1,
  filter?: string,
  size?: string,
  price?: string,
  availability?: string,
  brand?: string,
) {
  const normalized = category?.trim().toLowerCase();
  const isValidCategory =
    normalized &&
    CATEGORY_OPTIONS.some((c) => c.toLowerCase() === normalized);
  const search = q?.trim();
  const andConditions: object[] = [];
  if (isValidCategory) {
    andConditions.push({ categories: { has: normalized } });
  }
  if (search && search.length > 0) {
    andConditions.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ],
    });
  }
  if (filter === "new") {
    const sevenDaysAgo = new Date(Date.now() - SEVEN_DAYS_MS);
    andConditions.push({ createdAt: { gte: sevenDaysAgo } });
  }
  if (size?.trim()) {
    const sizeVal = size.trim().toUpperCase();
    andConditions.push({
      variants: { some: { size: { equals: sizeVal } } },
    });
  }
  const priceBand = price?.trim() && PRICE_BANDS[price.trim()];
  if (priceBand) {
    if (priceBand.min != null && priceBand.max != null) {
      andConditions.push({
        price: { gte: priceBand.min, lte: priceBand.max },
      });
    } else if (priceBand.min != null) {
      andConditions.push({ price: { gte: priceBand.min } });
    }
  }
  if (brand?.trim()) {
    andConditions.push({ brand: { equals: brand.trim(), mode: "insensitive" } });
  }
  if (availability === "in-stock") {
    andConditions.push({
      variants: { some: { inventory: { stockQuantity: { gt: 0 } } } },
    });
  } else if (availability === "sold-out") {
    andConditions.push({
      NOT: {
        variants: { some: { inventory: { stockQuantity: { gt: 0 } } } },
      },
    });
  }
  const where = andConditions.length > 0 ? (andConditions.length === 1 ? andConditions[0] : { AND: andConditions }) : undefined;
  const orderBy = getOrderBy(sort, filter);
  const skip = (Math.max(1, page) - 1) * PAGE_SIZE;

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        variants: { include: { inventory: true } },
        images: { orderBy: { position: "asc" } },
      },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, totalCount, page, hasMore: skip + products.length < totalCount };
}

const productInclude = {
  variants: { include: { inventory: true } },
  images: { orderBy: { position: "asc" } as const },
} as const;

async function getNewThisWeekProducts() {
  const sevenDaysAgo = new Date(Date.now() - SEVEN_DAYS_MS);
  return prisma.product.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    orderBy: { createdAt: "desc" },
    include: productInclude,
    take: 4,
  });
}

async function getBestValueProducts() {
  return prisma.product.findMany({
    orderBy: { price: "asc" },
    include: productInclude,
    take: 4,
  });
}

async function getBrands(): Promise<string[]> {
  const result = await prisma.product.findMany({
    select: { brand: true },
    distinct: ["brand"],
    where: { brand: { not: "" } },
    orderBy: { brand: "asc" },
  });
  return result.map((r) => r.brand).filter(Boolean);
}

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    q?: string;
    page?: string;
    filter?: string;
    size?: string;
    price?: string;
    availability?: string;
    brand?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, sort, q, page: pageParam, filter, size, price, availability, brand } = await searchParams;
  const page = Math.max(1, parseInt(String(pageParam ?? "1"), 10) || 1);
  const showHighlightSections = !category && page === 1;

  const [productsResult, newThisWeekProducts, bestValueProducts, brands] = await Promise.all([
    getProducts(category, sort, q, page, filter, size, price, availability, brand),
    showHighlightSections ? getNewThisWeekProducts() : Promise.resolve([]),
    showHighlightSections ? getBestValueProducts() : Promise.resolve([]),
    getBrands(),
  ]);

  const { products, totalCount, hasMore } = productsResult;
  const currentSort: string = SORT_OPTIONS.some((o) => o.value === sort) && sort ? sort : "latest";

  const buildUrl = (overrides?: {
    filter?: string | null;
    page?: number;
    size?: string | null;
    price?: string | null;
    availability?: string | null;
    brand?: string | null;
  }) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (sort && sort !== "latest") params.set("sort", sort);
    if (q?.trim()) params.set("q", q.trim());
    if (overrides && "filter" in overrides) {
      if (overrides.filter) params.set("filter", overrides.filter);
    } else if (filter) {
      params.set("filter", filter);
    }
    if (overrides && "size" in overrides) {
      if (overrides.size) params.set("size", overrides.size);
    } else if (size) params.set("size", size);
    if (overrides && "price" in overrides) {
      if (overrides.price) params.set("price", overrides.price);
    } else if (price) params.set("price", price);
    if (overrides && "availability" in overrides) {
      if (overrides.availability) params.set("availability", overrides.availability);
    } else if (availability) params.set("availability", availability);
    if (overrides && "brand" in overrides) {
      if (overrides.brand) params.set("brand", overrides.brand);
    } else if (brand) params.set("brand", brand);
    params.set("page", String(overrides?.page ?? page));
    return `/shop?${params.toString()}`;
  };

  return (
    <main className="flex flex-1 flex-col py-16 space-y-10">
      {/* 1. Shop hero strip */}
      <section className="rounded-3xl border border-gray-soft bg-white px-6 py-8 sm:px-10 sm:py-10 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-gray-deep/70">
              Verlano / Catalog
            </p>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Shop all surplus
              </h1>
              <p className="max-w-xl text-sm text-gray-deep/80">
                A rotating edit of surplus pieces from premium labels. Curated
                in small runs, priced for everyday wardrobes.
              </p>
            </div>
          </div>
          <div className="space-y-1 text-right text-xs text-gray-deep/70">
            <p className="uppercase tracking-[0.18em]">
              {totalCount} item{totalCount === 1 ? "" : "s"}
              {totalCount > PAGE_SIZE ? ` (page ${page})` : ""}
            </p>
            <p>Prices inclusive of all taxes.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <form
            method="get"
            action="/shop"
            className="flex flex-1 min-w-0 max-w-md items-center gap-2 rounded-full border border-gray-soft bg-white px-3 py-1.5"
          >
            {category ? <input type="hidden" name="category" value={category} /> : null}
            {sort && sort !== "latest" ? <input type="hidden" name="sort" value={sort} /> : null}
            {filter ? <input type="hidden" name="filter" value={filter} /> : null}
            {size ? <input type="hidden" name="size" value={size} /> : null}
            {price ? <input type="hidden" name="price" value={price} /> : null}
            {availability ? <input type="hidden" name="availability" value={availability} /> : null}
            {brand ? <input type="hidden" name="brand" value={brand} /> : null}
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by title or brand…"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-gray-deep/60 focus:outline-none"
              aria-label="Search products"
            />
          </form>
          <Suspense fallback={<div className="h-9 min-w-[140px] rounded-full border border-gray-soft bg-gray-soft/30" />}>
            <ShopCategorySelect currentCategory={category} />
          </Suspense>
          {filter && (
            <Link
              href={buildUrl({ filter: null, page: 1 })}
              className="rounded-full border border-gray-soft bg-white px-4 py-1.5 text-xs font-medium text-gray-deep/80 hover:border-gray-deep"
            >
              All
            </Link>
          )}
          <Link
            href={buildUrl({ filter: "new", page: 1 })}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
              filter === "new"
                ? "border-ink bg-ink text-white"
                : "border-gray-soft bg-gray-soft/40 text-gray-deep/80 hover:border-gray-deep"
            }`}
          >
            New this week
          </Link>
          <Link
            href={buildUrl({ filter: "value", page: 1 })}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
              filter === "value"
                ? "border-ink bg-ink text-white"
                : "border-gray-soft bg-white text-gray-deep/80 hover:border-gray-deep"
            }`}
          >
            Best value picks
          </Link>
        </div>
      </section>

      {/* Sort bar + filters + product grid */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-soft bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Suspense fallback={<div className="h-8 w-24 rounded-full border border-gray-soft bg-gray-soft/30" />}>
              <ShopSortSelect currentSort={currentSort} category={category} />
            </Suspense>
            <div className="lg:hidden">
              <Suspense fallback={<div className="h-8 w-20 rounded-full border border-gray-soft bg-gray-soft/30" />}>
                <ShopFilterSheet
                  currentSize={size}
                  currentPrice={price}
                  currentAvailability={availability}
                  currentBrand={brand}
                  brands={brands}
                  activeFilterCount={[size, price, availability, brand].filter(Boolean).length}
                />
              </Suspense>
            </div>
          </div>
          <div className="hidden lg:block">
            <Suspense fallback={<div className="h-8 w-48 rounded-full border border-gray-soft bg-gray-soft/30" />}>
              <ShopFilters
                currentSize={size}
                currentPrice={price}
                currentAvailability={availability}
                currentBrand={brand}
                brands={brands}
              />
            </Suspense>
          </div>
        </div>

        <div className="space-y-6">
            {/* Category highlight rows (only on first page, no category filter) */}
            {showHighlightSections && newThisWeekProducts.length > 0 && (
              <section className="rounded-2xl border border-gray-soft bg-white p-6 shadow-sm">
                <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-deep/80">
                    New this week
                  </h2>
                  <span className="text-[11px] text-gray-deep/60">
                    Curated from the latest arrivals
                  </span>
                </header>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                  {newThisWeekProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}
            {showHighlightSections && bestValueProducts.length > 0 && (
              <section className="rounded-2xl border border-gray-soft bg-white p-6 shadow-sm">
                <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-deep/80">
                    Best value picks
                  </h2>
                  <span className="text-[11px] text-gray-deep/60">
                    Great deals on premium pieces
                  </span>
                </header>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                  {bestValueProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* 6. Empty state when no products match */}
            {products.length === 0 ? (
              <div className="rounded-2xl border border-gray-soft bg-white px-6 py-16 text-center shadow-sm">
                <p className="text-sm font-medium text-gray-deep/90">
                  No products match your selection.
                </p>
                <p className="mt-2 text-xs text-gray-deep/70">
                  Try another category or view all products.
                </p>
                <a
                  href="/shop"
                  className="mt-6 inline-block rounded-full border border-ink bg-ink px-6 py-2 text-xs font-medium text-white transition hover:bg-ink/90"
                >
                  Clear filters / View all
                </a>
              </div>
            ) : (
              <>
                <ProductGrid products={products} />
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <a
                      href={buildUrl({ page: page + 1 })}
                      className="rounded-full border border-ink bg-white px-6 py-2.5 text-sm font-medium text-ink hover:bg-gray-soft/50 transition"
                    >
                      Load more
                    </a>
                  </div>
                )}
              </>
            )}
        </div>
      </section>
    </main>
  );
}


