import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { BrandsCarousel } from "@/components/home/BrandsCarousel";
import Image from "next/image";

export default async function Home() {
  const featuredProducts = await prisma.product.findMany({
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
    take: 8,
  });

  return (
    <main className="flex flex-1 flex-col gap-16 pt-0 pb-24">
      {/* 1. Hero carousel */}
      <HeroCarousel />

      {/* 2. Highlighted Benefits Strip */}
      <section className="rounded-3xl border border-gray-soft bg-gray-soft/40 px-10 py-6">
        <div className="grid gap-4 text-sm text-gray-deep/80 sm:grid-cols-3 md:grid-cols-4">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-ink">Up to 70% off retail</span>
            <span className="text-xs text-gray-deep/70">
              Surplus pieces from premium brands, priced for everyday wardrobes.
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-ink">
              Authentic surplus sourcing
            </span>
            <span className="text-xs text-gray-deep/70">
              Verified suppliers and transparent sourcing across Indian labels.
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-ink">Fast, trackable shipping</span>
            <span className="text-xs text-gray-deep/70">
              Shiprocket-powered delivery with live tracking for every order.
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-ink">
              Easy returns (coming soon)
            </span>
            <span className="text-xs text-gray-deep/70">
              We&apos;re designing a simple, app-first returns experience.
            </span>
          </div>
        </div>
      </section>

      {/* Brands we carry */}
      <BrandsCarousel />

      {/* 3. Featured Collections Row */}
      <section className="space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Curated collections
            </h2>
            <p className="text-sm text-gray-deep/80">
              Start with an edit that matches how you live and dress.
            </p>
          </div>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          <a
            href="/shop?collection=new-this-week"
            className="group flex flex-col justify-between rounded-2xl border border-gray-soft bg-white px-6 py-6 transition hover:-translate-y-1 hover:shadow-sm"
          >
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-deep/60">
                This week
              </p>
              <h3 className="text-lg font-medium text-ink">
                New this week
              </h3>
              <p className="text-sm text-gray-deep/80">
                Fresh surplus drops in limited runs, updated weekly.
              </p>
            </div>
            <span className="mt-4 text-xs font-medium text-ink group-hover:underline">
              Shop the latest
            </span>
          </a>
          <a
            href="/shop?collection=workwear"
            className="group flex flex-col justify-between rounded-2xl border border-gray-soft bg-white px-6 py-6 transition hover:-translate-y-1 hover:shadow-sm"
          >
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-deep/60">
                Office ready
              </p>
              <h3 className="text-lg font-medium text-ink">
                Workwear essentials
              </h3>
              <p className="text-sm text-gray-deep/80">
                Elevated shirts, trousers, and layers for long days.
              </p>
            </div>
            <span className="mt-4 text-xs font-medium text-ink group-hover:underline">
              Shop workwear
            </span>
          </a>
          <a
            href="/shop?collection=weekend"
            className="group flex flex-col justify-between rounded-2xl border border-gray-soft bg-white px-6 py-6 transition hover:-translate-y-1 hover:shadow-sm"
          >
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-deep/60">
                Off-duty
              </p>
              <h3 className="text-lg font-medium text-ink">
                Weekend / casual
              </h3>
              <p className="text-sm text-gray-deep/80">
                Relaxed staples for coffee runs, errands, and late nights.
              </p>
            </div>
            <span className="mt-4 text-xs font-medium text-ink group-hover:underline">
              Shop weekend
            </span>
          </a>
        </div>
      </section>

      {/* 4. Featured Products Grid */}
      <section className="space-y-6">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Featured picks
            </h2>
            <p className="text-sm text-gray-deep/80">
              A small edit of pieces we think you&apos;ll reach for the most.
            </p>
          </div>
          <a
            href="/shop"
            className="text-xs font-medium uppercase tracking-[0.18em] text-gray-deep/70 hover:text-ink"
          >
            View all
          </a>
        </header>
        <ProductGrid products={featuredProducts} />
      </section>

      {/* 5. Category Strips */}
      <section className="space-y-4">
        <header className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-deep/70">
            Shop by category
          </h2>
        </header>
        <div className="no-scrollbar -mx-2 flex gap-3 overflow-x-auto px-2 pb-1">
          {["Tops", "Bottoms", "Dresses", "Outerwear", "Co-ords"].map(
            (label) => (
              <a
                key={label}
                href={`/shop?category=${encodeURIComponent(
                  label.toLowerCase()
                )}`}
                className="whitespace-nowrap rounded-full border border-gray-soft bg-white px-4 py-2 text-xs font-medium text-ink transition hover:-translate-y-0.5 hover:bg-gray-soft/40"
              >
                {label}
              </a>
            )
          )}
        </div>
      </section>

      {/* 6. Editorial / Story Section */}
      <section className="grid gap-10 rounded-3xl border border-gray-soft bg-white px-8 py-12 shadow-sm sm:px-12 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-deep/70">
            About Verlano
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Luxury within reach.
          </h2>
          <p className="text-sm text-gray-deep/80">
            Verlano works with surplus from premium Indian and global brands —
            pieces that were overproduced, never shipped, or lightly sampled.
            Instead of sending them to landfills, we give them a second life at
            prices that feel honest.
          </p>
          <p className="text-sm text-gray-deep/80">
            Every drop is curated in small runs, photographed simply, and
            shipped with transparent tracking. You get the fabric, the fit, and
            the finish of luxury labels, without paying for heavy branding.
          </p>
          <a
            href="/about"
            className="inline-flex text-sm font-medium text-ink underline underline-offset-4 hover:text-gray-deep"
          >
            Learn more about Verlano
          </a>
        </div>
        <div className="relative h-64 overflow-hidden rounded-2xl border border-gray-soft bg-gray-soft/40 md:h-full">
          <Image
            src="/images/editorial-model-1.jpg"
            alt="Minimal editorial shot representing Verlano's story"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* 7. Email Capture / Early Access */}
      <section className="rounded-3xl border border-gray-soft bg-white px-8 py-8 sm:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.24em] text-gray-deep/70">
              Early access
            </p>
            <p className="text-sm text-gray-deep/80">
              Be the first to know about new surplus drops and private sales.
            </p>
          </div>
          <form
            className="flex w-full max-w-md gap-3"
            action="/api/newsletter"
            method="post"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="h-10 flex-1 rounded-full border border-gray-soft bg-white px-4 text-sm outline-none ring-0 focus:border-ink"
            />
            <button
              type="submit"
              className="h-10 rounded-full bg-ink px-5 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-ink/90"
            >
              Get access
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
