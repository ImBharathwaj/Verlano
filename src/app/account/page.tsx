import Link from "next/link";
import { getCurrentUserFromContext } from "@/lib/customer-auth";
import { SignOutButton } from "@/components/account/SignOutButton";
import { ProfileForm } from "@/components/account/ProfileForm";
import { AddressesSection } from "@/components/account/AddressesSection";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const user = await getCurrentUserFromContext();
  if (!user) return null;

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 50,
  });

  return (
    <main className="flex flex-1 flex-col py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Your account</h1>
      <p className="mt-2 text-sm text-gray-deep/80">
        Hello, {user.name}. Manage your orders and details here.
      </p>
      <div className="mt-8 space-y-6 rounded-2xl border border-gray-soft bg-white p-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-deep/80">
            Profile
          </h2>
          <ProfileForm />
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-deep/80">
            Addresses
          </h2>
          <p className="mt-1 text-xs text-gray-deep/70">
            Saved addresses for checkout. You can add, edit, or remove them here.
          </p>
          <AddressesSection />
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-deep/80">
            Orders
          </h2>
          {orders.length === 0 ? (
            <p className="mt-2 text-sm text-gray-deep/70">
              You haven’t placed any orders yet. Orders will appear here after checkout.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {orders.map((order) => {
                const date = new Date(order.createdAt).toLocaleDateString();
                const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
                return (
                  <li key={order.id}>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-soft bg-gray-soft/20 px-3 py-2 text-sm transition hover:border-gray-deep/30 hover:bg-gray-soft/40"
                    >
                      <span className="font-medium text-ink">
                        {date} · {itemCount} item{itemCount === 1 ? "" : "s"}
                      </span>
                      <span className="text-gray-deep/80">
                        ₹{(order.totalAmount / 100).toFixed(0)}
                      </span>
                      <span className="w-full text-[11px] uppercase tracking-wider text-gray-deep/70">
                        {order.paymentStatus} · {order.orderStatus}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="border-t border-gray-soft pt-4">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
