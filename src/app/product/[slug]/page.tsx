import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/product/AddToCart";
import { ProductGallery } from "@/components/product/ProductGallery";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

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

  const variantOptions = product.variants.map((v) => ({
    id: v.id,
    size: v.size,
    stock: v.inventory?.stockQuantity ?? 0,
  }));

  return (
    <main className="flex flex-1 flex-col py-12">
      <p className="mb-4 text-xs uppercase tracking-[0.25em] text-gray-deep/70">
        Product
      </p>
      <div className="grid gap-10 md:grid-cols-[minmax(0,1.7fr),minmax(0,1fr)]">
        {/* Left: main product content */}
        <section className="space-y-8">
          <section className="rounded-2xl border border-gray-soft bg-white px-4 py-4 sm:px-8 sm:py-8">
            <ProductGallery
              images={product.images}
              productTitle={product.title}
            />
          </section>
          <section className="space-y-6 rounded-2xl border border-gray-soft bg-white px-6 py-6">
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
            <p className="pt-4 text-sm leading-relaxed text-gray-deep/80">
              {product.description}
            </p>
          </section>
        </section>

        {/* Right: placeholder for recommended products */}
        <aside className="space-y-4 rounded-2xl border border-gray-soft bg-white px-6 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-deep/80">
            You may also like
          </h2>
          <p className="text-xs text-gray-deep/70">
            This area is reserved for recommended products and cross-sells. We
            can wire it up to show related items in a future step.
          </p>
        </aside>
      </div>
    </main>
  );
}


