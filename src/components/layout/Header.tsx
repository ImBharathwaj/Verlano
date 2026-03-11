import Link from "next/link";
import { CartTrigger } from "@/components/cart/CartTrigger";

export function Header() {
  return (
    <header className="border-b border-gray-soft bg-ink text-ivory">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-base font-semibold tracking-[0.25em] uppercase"
        >
          Verlano
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-ivory/80">
          <Link href="/shop">Shop</Link>
          <CartTrigger />
          <Link href="/account">Account</Link>
        </nav>
      </div>
    </header>
  );
}


