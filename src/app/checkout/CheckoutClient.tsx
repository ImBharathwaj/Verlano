"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CartResponse } from "@/types/cart";

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      order_id: string;
      name: string;
      handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => void;
    }) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}

export function CheckoutClient() {
  const router = useRouter();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    shippingName: "",
    shippingPhone: "",
    shippingStreet: "",
    shippingCity: "",
    shippingState: "",
    shippingPostalCode: "",
  });

  const fetchCart = useCallback(async () => {
    const res = await fetch("/api/cart");
    const data = await res.json();
    setCart(data);
  }, []);

  useEffect(() => {
    fetchCart().finally(() => setLoading(false));
  }, [fetchCart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitStatus("loading");

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setSubmitStatus("error");
      setErrorMessage(data.error ?? "Checkout failed");
      return;
    }

    const { orderId, razorpayOrderId, amount, currency, key } = data;

    if (!key || !razorpayOrderId) {
      setSubmitStatus("error");
      setErrorMessage("Payment gateway not configured");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const Razorpay = window.Razorpay;
      if (!Razorpay) {
        setSubmitStatus("error");
        setErrorMessage("Payment gateway failed to load");
        return;
      }

      const rzp = new Razorpay({
        key,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: "Verlano",
        handler: async (response) => {
          const verifyRes = await fetch(`/api/orders/${orderId}/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            router.push(`/checkout/success?orderId=${orderId}`);
          } else {
            setSubmitStatus("error");
            setErrorMessage(verifyData.error ?? "Payment verification failed");
          }
        },
      });

      rzp.on("payment.failed", () => {
        setSubmitStatus("error");
        setErrorMessage("Payment failed or was cancelled.");
      });

      rzp.open();
      setSubmitStatus("idle");
    };
  };

  if (loading) {
    return (
      <main className="flex flex-1 flex-col py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-4 text-sm text-gray-deep/70">Loading...</p>
      </main>
    );
  }

  const items = cart?.items ?? [];
  const total = cart?.total ?? 0;

  if (items.length === 0) {
    return (
      <main className="flex flex-1 flex-col py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-2 text-sm text-gray-deep/80">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-black/90"
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
      <p className="mt-2 text-sm text-gray-deep/80">
        Enter your shipping details and complete payment.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-10 md:grid-cols-[1fr,340px]">
        <div className="space-y-6 rounded-2xl border border-gray-soft bg-white px-6 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-deep/80">
            Shipping address
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="mb-1 block text-xs font-medium text-gray-deep/80">
                Full name
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.shippingName}
                onChange={(e) => setForm((f) => ({ ...f, shippingName: e.target.value }))}
                className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-xs font-medium text-gray-deep/80">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={form.shippingPhone}
                onChange={(e) => setForm((f) => ({ ...f, shippingPhone: e.target.value }))}
                className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="street" className="mb-1 block text-xs font-medium text-gray-deep/80">
                Address
              </label>
              <input
                id="street"
                type="text"
                required
                value={form.shippingStreet}
                onChange={(e) => setForm((f) => ({ ...f, shippingStreet: e.target.value }))}
                className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
              />
            </div>
            <div>
              <label htmlFor="city" className="mb-1 block text-xs font-medium text-gray-deep/80">
                City
              </label>
              <input
                id="city"
                type="text"
                required
                value={form.shippingCity}
                onChange={(e) => setForm((f) => ({ ...f, shippingCity: e.target.value }))}
                className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
              />
            </div>
            <div>
              <label htmlFor="state" className="mb-1 block text-xs font-medium text-gray-deep/80">
                State
              </label>
              <input
                id="state"
                type="text"
                required
                value={form.shippingState}
                onChange={(e) => setForm((f) => ({ ...f, shippingState: e.target.value }))}
                className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
              />
            </div>
            <div>
              <label htmlFor="postalCode" className="mb-1 block text-xs font-medium text-gray-deep/80">
                Postal code
              </label>
              <input
                id="postalCode"
                type="text"
                required
                value={form.shippingPostalCode}
                onChange={(e) => setForm((f) => ({ ...f, shippingPostalCode: e.target.value }))}
                className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
              />
            </div>
          </div>
          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}
        </div>

        <div className="h-fit space-y-4 rounded-2xl border border-gray-soft bg-white px-6 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-deep/80">
            Order summary
          </h2>
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span className="text-gray-deep/90">
                  {item.productTitle} × {item.quantity}
                </span>
                <span>₹{((item.price * item.quantity) / 100).toFixed(0)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-gray-soft pt-3 text-sm font-medium">
            <span>Subtotal</span>
            <span>₹{(total / 100).toFixed(0)}</span>
          </div>
          <p className="text-xs text-gray-deep/60">
            Shipping and taxes calculated at checkout.
          </p>
          <button
            type="submit"
            disabled={submitStatus === "loading"}
            className="w-full rounded-full bg-black py-3 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
          >
            {submitStatus === "loading" ? "Preparing…" : "Pay with Razorpay"}
          </button>
          <Link
            href="/cart"
            className="block text-center text-sm text-gray-deep/80 hover:text-black"
          >
            ← Back to cart
          </Link>
        </div>
      </form>
    </main>
  );
}
