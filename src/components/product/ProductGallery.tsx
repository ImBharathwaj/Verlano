"use client";

import * as React from "react";
import { OptimizedProductImage } from "./OptimizedProductImage";

type ProductImage = {
  id?: string;
  url: string;
  alt: string | null;
};

type ProductGalleryProps = {
  images: ProductImage[];
  productTitle: string;
};

export function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const safeImages =
    images && images.length > 0
      ? images
      : [{ url: "", alt: productTitle ?? null }];

  const [activeIndex, setActiveIndex] = React.useState(0);
   const [isZooming, setIsZooming] = React.useState(false);
   const [zoomPos, setZoomPos] = React.useState<{ x: number; y: number }>({
     x: 50,
     y: 50,
   });

  const activeImage = safeImages[activeIndex] ?? safeImages[0];

  return (
    <div className="relative space-y-4">
      <div className="relative flex flex-col gap-4 md:flex-row">
        {/* Main image with hover tracking */}
        <div
          className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-gray-soft bg-gray-soft/20 md:max-w-[55%]"
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            setZoomPos({
              x: Math.max(0, Math.min(100, x)),
              y: Math.max(0, Math.min(100, y)),
            });
          }}
        >
          {activeImage.url ? (
            <OptimizedProductImage
              src={activeImage.url}
              alt={activeImage.alt ?? productTitle}
              layout="gallery"
              className="h-full w-full origin-center scale-100"
            />
          ) : (
            <div className="h-full w-full border border-dashed border-gray-soft bg-gray-soft/40" />
          )}
        </div>

        {/* Zoom pane: overlays product details area (positioned on top of right column) */}
        {activeImage.url && (
          <div
            className="pointer-events-none absolute left-[calc(55%+0.5rem)] top-0 z-30 hidden h-[320px] w-[320px] overflow-hidden rounded-2xl border border-gray-soft bg-white shadow-xl md:block lg:h-[380px] lg:w-[380px]"
            style={{
              opacity: isZooming ? 1 : 0,
              transition: "opacity 150ms ease-out",
            }}
          >
            <div
              className="h-full w-full bg-gray-soft/5"
              style={{
                backgroundImage: `url(${activeImage.url})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "500% 500%",
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
            />
          </div>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {safeImages.map((img, index) => (
            <button
              key={(img.id ?? img.url) + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border ${
                index === activeIndex
                  ? "border-ink"
                  : "border-gray-soft hover:border-gray-deep"
              } bg-gray-soft/20`}
            >
              {img.url ? (
                <OptimizedProductImage
                  src={img.url}
                  alt={img.alt ?? productTitle}
                  layout="thumbnail"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


