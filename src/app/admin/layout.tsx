import type { ReactNode } from "react";
import Link from "next/link";
import { AdminSignOut } from "@/components/admin/AdminSignOut";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-[80vh] gap-8 py-12">
      <aside className="w-56 shrink-0">
        <div className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-gray-deep/70">
          Admin
        </div>
        <nav className="space-y-2 text-sm">
          <Link href="/admin" className="block text-gray-deep/80 hover:text-black">
            Dashboard
          </Link>
          <Link href="/admin/products" className="block text-gray-deep/80 hover:text-black">
            Products
          </Link>
          <Link href="/admin/orders" className="block text-gray-deep/80 hover:text-black">
            Orders
          </Link>
          <AdminSignOut />
        </nav>
      </aside>
      <section className="flex-1">{children}</section>
    </main>
  );
}
