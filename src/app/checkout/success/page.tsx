import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type SearchParams = { searchParams: Promise<{ orderId?: string }> };

export default async function CheckoutSuccessPage({ searchParams }: SearchParams) {
  const { orderId } = await searchParams;
  if (!orderId) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      totalAmount: true,
      paymentStatus: true,
      orderStatus: true,
    },
  });
  if (!order) notFound();

  return (
    <main className="flex flex-1 flex-col py-12">
      <div className="mx-auto max-w-lg rounded-2xl border border-gray-soft bg-white px-8 py-10 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Thank you</h1>
        <p className="mt-2 text-sm text-gray-deep/80">
          Your order has been placed successfully.
        </p>
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-gray-deep/70">
          Order #{order.id.slice(0, 8)}
        </p>
        <p className="mt-2 text-lg font-semibold">
          ₹{(order.totalAmount / 100).toFixed(0)}
        </p>
        <p className="mt-4 text-xs text-gray-deep/60">
          Payment status: {order.paymentStatus}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-black/90"
          >
            Continue shopping
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-deep/80 hover:text-black"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
