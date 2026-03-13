import type { Product, ProductVariant, Inventory, ProductImage } from "@prisma/client";
import { ProductCard } from "./ProductCard";

type ProductWithRelations = Product & {
  variants: (ProductVariant & { inventory: Inventory | null })[];
  images: ProductImage[];
};

type ProductGridProps = {
  products: ProductWithRelations[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-soft bg-white px-8 py-10 text-sm text-gray-deep/70">
        No products yet. Once you add items via the admin or seed script,
        they&apos;ll appear here.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

