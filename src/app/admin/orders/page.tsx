import { prisma } from "@/lib/prisma";
import { AdminOrderFilters } from "@/components/admin/AdminOrderFilters";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

type Props = { searchParams: Promise<{ orderStatus?: string; paymentStatus?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { orderStatus, paymentStatus } = await searchParams;
  const where: { orderStatus?: string; paymentStatus?: string } = {};
  if (orderStatus && ORDER_STATUSES.includes(orderStatus)) where.orderStatus = orderStatus;
  if (paymentStatus && PAYMENT_STATUSES.includes(paymentStatus)) where.paymentStatus = paymentStatus;

  const orders = await prisma.order.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy: { createdAt: "desc" },
  });

  const serialized = orders.map((o) => ({
    id: o.id,
    totalAmount: o.totalAmount,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    shippingName: o.shippingName,
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-gray-deep/80">
            View and manage customer orders. Select rows to update status in bulk.
          </p>
        </div>
        <AdminOrderFilters orderStatus={orderStatus} paymentStatus={paymentStatus} />
      </div>
      <AdminOrdersTable orders={serialized} />
    </div>
  );
}
