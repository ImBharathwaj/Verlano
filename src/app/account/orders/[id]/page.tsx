import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUserFromContext } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export default async function AccountOrderPage({ params }: Params) {
  const { id } = await params;
  const user = await getCurrentUserFromContext();
  if (!user) return null;

  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
      payment: true,
    },
  });

  if (!order) notFound();

  const date = new Date(order.createdAt).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });

  return (
    <main className="flex flex-1 flex-col py-12">
      <Link
        href="/account"
        className="text-sm text-gray-deep/80 hover:text-ink transition"
      >
        ← Back to account
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        Order {order.id.slice(0, 8)}
      </h1>
      <p className="mt-1 text-sm text-gray-deep/80">
        Placed on {date} · {order.paymentStatus === "cod" ? "Cash on Delivery" : order.paymentStatus} · {order.orderStatus}
      </p>

      <div className="mt-6 space-y-6 rounded-2xl border border-gray-soft bg-white p-6">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-deep/80">
            Items
          </h2>
          <ul className="mt-3 space-y-2">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-soft/60 pb-2 last:border-0 last:pb-0"
              >
                <div>
                  <Link
                    href={`/product/${item.variant.product.slug}`}
                    className="font-medium text-ink hover:underline"
                  >
                    {item.variant.product.title}
                  </Link>
                  <p className="text-xs text-gray-deep/70">
                    {item.variant.size}
                    {item.variant.color ? ` · ${item.variant.color}` : ""} ×{" "}
                    {item.quantity}
                  </p>
                </div>
                <span className="text-sm text-gray-deep/80">
                  ₹{((item.price * item.quantity) / 100).toFixed(0)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-deep/80">
            Total
          </h2>
          {order.discountAmount > 0 && (
            <p className="mt-2 text-sm text-gray-deep/80">
              Discount ({order.couponCode ?? "coupon"}): -₹{(order.discountAmount / 100).toFixed(0)}
            </p>
          )}
          <p className="mt-2 text-lg font-semibold">
            ₹{(order.totalAmount / 100).toFixed(0)}
          </p>
          {order.payment?.transactionId && (
            <p className="mt-1 text-xs text-gray-deep/70">
              Payment ID: {order.payment.transactionId}
            </p>
          )}
        </section>

        {(order.shippingName || order.shippingStreet) && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-deep/80">
              Shipping address
            </h2>
            <p className="mt-2 text-sm text-gray-deep/90">
              {order.shippingName}
              {order.shippingPhone && ` · ${order.shippingPhone}`}
              <br />
              {order.shippingStreet}
              {order.shippingCity && `, ${order.shippingCity}`}
              {order.shippingState && `, ${order.shippingState}`}
              {order.shippingPostalCode && ` ${order.shippingPostalCode}`}
            </p>
          </section>
        )}

        {order.trackingUrl && (
          <section>
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full border border-gray-deep/30 px-4 py-2 text-sm font-medium text-ink hover:bg-gray-soft/50 transition"
            >
              Track shipment
            </a>
            {order.trackingId && (
              <p className="mt-1 text-xs text-gray-deep/70">
                Tracking ID: {order.trackingId}
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
