import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/product/AddToCart";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { WishlistButton } from "@/components/product/WishlistButton";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });
  if (!product) return { title: "Product" };
  const title = `${product.title}${product.brand ? ` · ${product.brand}` : ""}`;
  const description =
    product.description?.slice(0, 160) ||
    `Shop ${product.title} at Verlano. Premium surplus fashion at insider prices.`;
  const image =
    product.images[0]?.url ?? undefined;
  return {
    title,
    description,
    openGraph: {
      title: `${title} | Verlano`,
      description,
      images: image ? [{ url: image, alt: product.images[0]?.alt ?? product.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Verlano`,
      description,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
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
  });

  if (!product) {
    notFound();
  }

  const orConditions: Array<{ categories: { hasSome: string[] } } | { brand: string }> = [];
  if (product.categories.length > 0) orConditions.push({ categories: { hasSome: product.categories } });
  if (product.brand) orConditions.push({ brand: product.brand });

  const relatedProducts = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      ...(orConditions.length > 0 ? { OR: orConditions } : {}),
    },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      variants: { include: { inventory: true } },
      images: { orderBy: { position: "asc" } },
    },
  });

  const variantOptions = product.variants.map((v) => {
    const inv = v.inventory;
    const stockQty = inv?.stockQuantity ?? 0;
    const reservedQty = inv?.reservedQuantity ?? 0;
    const available = Math.max(0, stockQty - reservedQty);
    return {
      id: v.id,
      size: v.size,
      color: v.color ?? null,
      stock: available,
    };
  });

  const hasStock = variantOptions.some((v) => v.stock > 0);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://verlano.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? undefined,
    image: product.images.length > 0 ? product.images.map((i) => i.url) : undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      price: product.price / 100,
      priceCurrency: "INR",
      availability: hasStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${baseUrl.replace(/\/$/, "")}/product/${product.slug}`,
    },
  };

  return (
    <main className="flex flex-1 flex-col py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="mb-4 text-xs uppercase tracking-[0.25em] text-gray-deep/70">
        Product
      </p>
      <div className="grid gap-10 lg:grid-cols-[1fr,minmax(0,320px)]">
        {/* Main: image (left) + details (right), zoom overlays details on hover */}
        <div className="relative grid gap-6 overflow-visible rounded-2xl border border-gray-soft bg-white p-4 sm:p-6 md:grid-cols-[minmax(0,1fr),minmax(0,1fr)]">
          <div className="relative min-w-0">
            <ProductGallery
              images={product.images}
              productTitle={product.title}
            />
          </div>
          <section className="relative z-0 space-y-5 px-1">
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-deep/70">
                {product.brand}
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-black">
                {product.title}
              </h1>
            </div>
            <div className="space-x-2">
              <span className="text-xl font-semibold text-black">
                ₹{(product.price / 100).toFixed(0)}
              </span>
              {product.comparePrice && (
                <span className="text-sm text-gray-deep/60 line-through">
                  ₹{(product.comparePrice / 100).toFixed(0)}
                </span>
              )}
            </div>
            <AddToCart variants={variantOptions} />
            <div className="pt-2">
              <WishlistButton productId={product.id} />
            </div>
            <p className="pt-2 text-sm leading-relaxed text-gray-deep/80">
              {product.description}
            </p>
          </section>
        </div>

        {/* Right: related products */}
        <aside className="space-y-4 rounded-2xl border border-gray-soft bg-white px-6 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-deep/80">
            You may also like
          </h2>
          {relatedProducts.length > 0 ? (
            <ProductGrid products={relatedProducts} />
          ) : (
            <p className="text-xs text-gray-deep/70">
              More products coming soon.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}


