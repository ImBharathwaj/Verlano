"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CartTrigger } from "@/components/cart/CartTrigger";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors ${
        scrolled
          ? "border-gray-soft bg-white/95 text-ink backdrop-blur"
          : "border-transparent bg-transparent text-white"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-base font-semibold tracking-[0.25em] uppercase"
        >
          Verlano
        </Link>
        <nav className="flex items-center gap-10 text-sm font-medium">
          <Link href="/shop" className="hover:opacity-80">
            Shop
          </Link>
          <CartTrigger />
          <Link href="/account" className="hover:opacity-80">
            Account
          </Link>
        </nav>
      </div>
    </header>
  );
}


