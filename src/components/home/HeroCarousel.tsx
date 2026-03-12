"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/images/hero-1.jpg",
    alt: "Model in tailored surplus blazer",
  },
  {
    src: "/images/hero-2.jpg",
    alt: "Model in relaxed weekend staples",
  },
  {
    src: "/images/hero-3.jpg",
    alt: "Close-up of premium fabric and detailing",
  },
  {
    src: "/images/hero-4.jpg",
    alt: "Close-up of premium fabric and detailing",
  },
  {
    src: "/images/hero-5.jpg",
    alt: "Close-up of premium fabric and detailing",
  },
  {
    src: "/images/hero-6.jpg",
    alt: "Close-up of premium fabric and detailing",
  },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative left-1/2 right-1/2 min-h-screen w-screen max-w-none -mx-[50vw] overflow-hidden bg-black">
      {/* Fullscreen slides */}
      <div className="absolute inset-0">
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent" />
      </div>

      {/* Overlay content */}
      <div className="relative z-10 flex min-h-screen flex-col px-6 py-10 sm:px-12 md:px-16">
        <div className="flex flex-1 items-center">
          <div className="w-full">
            <header className="ml-0 max-w-xl space-y-6 text-white sm:ml-[10vw] lg:ml-[30vw]">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/70">
                Verlano / New surplus arrivals
              </p>
              <div className="space-y-5">
                <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                  Luxury surplus fashion,
                  <br />
                  <span className="text-white/85">at insider prices.</span>
                </h1>
                <p className="text-sm leading-relaxed tracking-[0.04em] text-white/85">
                  Curated surplus garments from premium Indian and global
                  brands. Minimal, elegant, and accessible – designed for young
                  professionals and students who refuse to compromise on style.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-5">
                <a
                  href="/shop"
                  className="rounded-full bg-white px-7 py-2.5 text-sm font-medium text-ink transition hover:bg-gray-soft"
                >
                  Shop collection
                </a>
                <a
                  href="/shop?sort=new"
                  className="rounded-full border border-white/80 px-7 py-2.5 text-sm font-medium text-white transition hover:bg-white/5"
                >
                  New arrivals
                </a>
              </div>
            </header>
          </div>
        </div>

        <div className="mb-4 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

