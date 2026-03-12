import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";

async function getProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      variants: {
        include: {
          inventory: true,
        },
      },
    },
    take: 36,
  });

  return products;
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <main className="flex flex-1 flex-col py-16 space-y-10">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Shop</h1>
          <p className="text-sm text-gray-deep/80">
            Browse curated surplus pieces from premium brands.
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-gray-deep/60">
          {products.length} item{products.length === 1 ? "" : "s"}
        </p>
      </header>
      <ProductGrid products={products} />
    </main>
  );
}


