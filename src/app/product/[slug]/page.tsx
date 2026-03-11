import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/product/AddToCart";

type ProductPageProps = {
  params: { slug: string };
};

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      variants: {
        include: {
          inventory: true,
        },
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
      <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)]">
        <section className="rounded-2xl border border-gray-soft bg-white px-8 py-10">
          <div className="aspect-[4/5] w-full rounded-2xl border border-dashed border-gray-soft bg-gray-soft/40" />
        </section>
        <section className="space-y-6">
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
      </div>
    </main>
  );
}


