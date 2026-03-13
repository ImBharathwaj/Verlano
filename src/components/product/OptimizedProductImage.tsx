"use client";

import Image from "next/image";

type OptimizedProductImageProps = {
  src: string;
  alt: string;
  /** Layout: "card" for product grid cards, "gallery" for PDP main image, "thumbnail" for small thumbnails */
  layout?: "card" | "gallery" | "thumbnail";
  className?: string;
  priority?: boolean;
};

/**
 * Uses next/image for product images. Remote URLs use unoptimized to ensure
 * reliable loading when MinIO/external hosts are unreachable from the server.
 */
export function OptimizedProductImage({
  src,
  alt,
  layout = "card",
  className = "",
  priority = false,
}: OptimizedProductImageProps) {
  const isRemote = src.startsWith("http://") || src.startsWith("https://");
  const unoptimized = isRemote;

  const sizes =
    layout === "card"
      ? "(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
      : layout === "gallery"
        ? "(max-width: 768px) 100vw, 55vw"
        : "64px";

  if (layout === "thumbnail") {
    return (
      <Image
        src={src}
        alt={alt}
        width={64}
        height={64}
        className={className}
        unoptimized={unoptimized}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={`object-cover ${className}`}
      unoptimized={unoptimized}
      priority={priority}
    />
  );
}
