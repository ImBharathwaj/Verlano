import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CATEGORY_OPTIONS } from "@/lib/categories";

async function getProducts(category?: string) {
  const normalized = category?.trim().toLowerCase();
  const isValidCategory =
    normalized &&
    CATEGORY_OPTIONS.some((c) => c.toLowerCase() === normalized);
  const where =
    isValidCategory
      ? {
          categories: {
            has: normalized,
          },
        }
      : undefined;

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      variants: {
        include: {
          inventory: true,
        },
      },
      images: {
        orderBy: { position: "asc" },
      },
    },
    take: 48,
  });

  return products;
}

type ShopPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category } = await searchParams;
  const products = await getProducts(category);

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
              {products.length} item{products.length === 1 ? "" : "s"}
            </p>
            <p>Prices inclusive of all taxes.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full border border-gray-soft bg-gray-soft/40 px-4 py-1.5 text-xs font-medium text-gray-deep/80"
          >
            New this week
          </button>
          <button
            type="button"
            className="rounded-full border border-gray-soft bg-white px-4 py-1.5 text-xs font-medium text-gray-deep/80"
          >
            Best value picks
          </button>
        </div>

        {/* Category chips */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {CATEGORY_OPTIONS.map((cat) => {
            const isActive =
              category && category.toLowerCase() === cat.toLowerCase();
            const baseHref =
              typeof window === "undefined"
                ? `/shop?category=${encodeURIComponent(cat)}`
                : undefined;

            return (
              <a
                key={cat}
                href={`/shop?category=${encodeURIComponent(cat)}`}
                className={`rounded-full border px-3 py-1 font-medium capitalize ${
                  isActive
                    ? "border-ink bg-ink text-white"
                    : "border-gray-soft bg-white text-gray-deep/80 hover:border-gray-deep"
                }`}
              >
                {cat}
              </a>
            );
          })}
        </div>
      </section>

      {/* Sort bar + product grid */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-soft bg-white px-4 py-3 text-xs text-gray-deep/80">
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-[0.18em] text-gray-deep/70">
              Sort
            </span>
            <select className="h-8 rounded-full border border-gray-soft bg-white px-3 text-xs text-gray-deep/90">
              <option value="latest">Latest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
            {/* 5. Category highlight rows (UI-only, currently disabled when a category filter is active) */}
            {!category && products.length > 4 && (
              <section className="space-y-4">
                <header className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-deep/80">
                    New this week
                  </h2>
                  <span className="text-[11px] text-gray-deep/60">
                    Curated from the latest arrivals
                  </span>
                </header>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {products.slice(0, 4).map((product) => (
                    <div key={product.id}>
                      <ProductGrid products={[product]} />
                    </div>
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
              <ProductGrid products={products} />
            )}
        </div>
      </section>
    </main>
  );
}


