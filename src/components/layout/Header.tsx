"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartTrigger } from "@/components/cart/CartTrigger";

type SessionUser = { id: string; name: string; email: string } | null;

function fetchSession(): Promise<SessionUser | null> {
  return fetch("/api/auth/session", { credentials: "include" })
    .then((res) => res.json())
    .then((data) => data.user ?? null)
    .catch(() => null);
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SessionUser | undefined>(undefined);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetchSession().then(setUser);
  }, [pathname]);

  const navClass = "hover:opacity-80";
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
          <Link href="/shop" className={navClass}>
            Shop
          </Link>
          <CartTrigger />
          {user !== undefined &&
            (user ? (
              <Link href="/account" className={navClass}>
                Account
              </Link>
            ) : (
              <Link href="/login" className={navClass}>
                Sign in
              </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}


