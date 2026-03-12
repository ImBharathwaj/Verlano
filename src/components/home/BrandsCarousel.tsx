"use client";

import Image from "next/image";

const brands = [
  { src: "/images/brands/Adidas.png", alt: "Adidas" },
  { src: "/images/brands/Levis.png", alt: "Levi's" },
  { src: "/images/brands/Gant.png", alt: "Gant" },
  { src: "/images/brands/Reebok.png", alt: "Reebok" },
  { src: "/images/brands/puma.png", alt: "Puma" },
  { src: "/images/brands/Lacoste.png", alt: "Lacoste" },
  { src: "/images/brands/Lee.png", alt: "Lee" },
  { src: "/images/brands/Nike.png", alt: "Nike" },
  { src: "/images/brands/Mango.png", alt: "Mango" },
  { src: "/images/brands/Wrangler.png", alt: "Wrangler" },
  { src: "/images/brands/Ralph-Lauren.png", alt: "Ralph Lauren" },
  { src: "/images/brands/armani.png", alt: "Armani" },
  { src: "/images/brands/calvin_klein.png", alt: "Calvin Klein" },
  { src: "/images/brands/boss-hugo.png", alt: "Hugo Boss" },
  { src: "/images/brands/Tommy-Hilfiger.png", alt: "Tommy Hilfiger" },
  { src: "/images/brands/Zara.png", alt: "Zara" },
  { src: "/images/brands/Diesel.png", alt: "Diesel" },
  { src: "/images/brands/COS.png", alt: "COS" },
];

export function BrandsCarousel() {
  return (
    <section className="space-y-6">
      <header className="text-center">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          Brands we carry
        </h2>
        <p className="mt-2 text-sm text-gray-deep/80">
          Premium surplus from the names you trust.
        </p>
      </header>
      <div className="relative overflow-hidden">
        <div className="flex min-w-max animate-marquee gap-12 whitespace-nowrap py-4">
          {[...brands, ...brands].map((brand, i) => (
            <div
              key={`${brand.src}-${i}`}
              className="flex h-12 w-28 shrink-0 items-center justify-center grayscale transition hover:grayscale-0"
            >
              <Image
                src={brand.src}
                alt={brand.alt}
                width={112}
                height={48}
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
