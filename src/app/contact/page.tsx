export const metadata = {
  title: "Contact",
  description: "Get in touch with Verlano for orders, returns, or support.",
};

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Contact & help</h1>
      <p className="mt-2 text-sm text-gray-deep/80">
        For order questions, returns, or general support, reach out by email.
      </p>
      <div className="mt-8 rounded-2xl border border-gray-soft bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-deep/80">
          Email
        </h2>
        <a
          href="mailto:support@verlano.com"
          className="mt-2 inline-block text-lg font-medium text-ink underline hover:no-underline"
        >
          support@verlano.com
        </a>
        <p className="mt-2 text-xs text-gray-deep/70">
          We aim to respond within 24 hours on business days.
        </p>
      </div>
      <div className="mt-6 rounded-2xl border border-gray-soft bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-deep/80">
          Order tracking
        </h2>
        <p className="mt-2 text-sm text-gray-deep/80">
          Use our{" "}
          <a href="/track-order" className="font-medium text-ink underline hover:no-underline">
            Track order
          </a>{" "}
          page with your order ID and email to check status and tracking.
        </p>
      </div>
    </main>
  );
}
