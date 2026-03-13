import Link from "next/link";
import type { Product, ProductVariant, Inventory, ProductImage } from "@prisma/client";

const NEW_BADGE_DAYS = 7;

type ProductWithRelations = Product & {
  variants: (ProductVariant & { inventory: Inventory | null })[];
  images: ProductImage[];
};

type ProductCardProps = {
  product: ProductWithRelations;
};

function isNewProduct(createdAt: Date): boolean {
  const cutoff = new Date(Date.now() - NEW_BADGE_DAYS * 24 * 60 * 60 * 1000);
  return new Date(createdAt) >= cutoff;
}

export function ProductCard({ product }: ProductCardProps) {
  const isNew = isNewProduct(product.createdAt);
  const minPrice =
    product.variants.length > 0
      ? Math.min(...product.variants.map((v) => v.price))
      : product.price;

  const totalStock = product.variants.reduce((sum, v) => {
    const inv = v.inventory;
    const stockQty = inv?.stockQuantity ?? 0;
    const reservedQty = inv?.reservedQuantity ?? 0;
    return sum + Math.max(0, stockQty - reservedQty);
  }, 0);

  const images = product.images ?? [];
  const primaryImage =
    images.find((img) => img.isPrimary) ?? images[0] ?? null;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex min-w-0 flex-col justify-between rounded-2xl border border-gray-soft bg-white p-4 shadow-[0_8px_20px_rgba(0,0,0,0.02)] transition-transform transition-shadow duration-300 hover:-translate-y-2 hover:border-black hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
    >
      {primaryImage?.url && (
        <div className="mb-4 min-w-0 flex-shrink-0">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-gray-soft bg-gray-soft/20">
            {isNew && (
              <span className="absolute left-2 top-2 z-10 rounded-full bg-ink px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
                New
              </span>
            )}
            <img
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.title}
              className="h-full w-full origin-center scale-100 object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-deep/70">
          {product.brand}
        </p>
        <h2 className="line-clamp-2 text-sm font-medium text-black">
          {product.title}
        </h2>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <div className="space-x-2">
          <span className="text-sm font-semibold text-black">
            ₹{(minPrice / 100).toFixed(0)}
          </span>
          {product.comparePrice && (
            <span className="text-xs text-gray-deep/60 line-through">
              ₹{(product.comparePrice / 100).toFixed(0)}
            </span>
          )}
        </div>
        <span className="text-[11px] uppercase tracking-[0.18em] text-gray-deep/60">
          {totalStock > 0 ? "In stock" : "Sold out"}
        </span>
      </div>
    </Link>
  );
}

