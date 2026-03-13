import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const RESEND_FROM = process.env.RESEND_FROM ?? "Verlano <onboarding@resend.dev>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://verlano.com";

/**
 * Send order confirmation email after payment success.
 * No-op if RESEND_API_KEY is not set.
 */
export async function sendOrderConfirmationEmail(orderId: string): Promise<void> {
  if (!RESEND_API_KEY.trim()) {
    return;
  }
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: { include: { product: { select: { title: true } } } },
          },
        },
        user: { select: { email: true } },
      },
    });
    if (!order) return;
    const toEmail = order.shippingEmail ?? order.user?.email ?? null;
    if (!toEmail?.trim()) return;

    const trackUrl = `${SITE_URL.replace(/\/$/, "")}/track-order`;
    const itemsList = order.items
      .map(
        (i) =>
          `• ${i.variant.product.title} (×${i.quantity}) — ₹${((i.price * i.quantity) / 100).toFixed(0)}`
      )
      .join("\n");
    const total = (order.totalAmount / 100).toFixed(0);
    const html = `
      <h2>Order confirmed</h2>
      <p>Thanks for your order. Here’s a quick summary.</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Items:</strong></p>
      <pre style="font-family: sans-serif; white-space: pre-wrap;">${itemsList}</pre>
      <p><strong>Total: ₹${total}</strong></p>
      <p>Track your order: <a href="${trackUrl}">${trackUrl}</a></p>
      <p>Use your Order ID and email to check status.</p>
    `;

    const resend = new Resend(RESEND_API_KEY.trim());
    await resend.emails.send({
      from: RESEND_FROM,
      to: [toEmail.trim()],
      subject: `Order confirmed #${order.id.slice(0, 8)} — Verlano`,
      html,
    });
  } catch (err) {
    console.error("[sendOrderConfirmationEmail]", err);
  }
}
