"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-xl font-semibold tracking-tight text-black">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-gray-deep/80">
        We couldn’t load this page. Please try again or head back to the shop.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-ink bg-ink px-6 py-2 text-sm font-medium text-white transition hover:bg-ink/90"
        >
          Try again
        </button>
        <Link
          href="/shop"
          className="rounded-full border border-gray-deep/30 bg-white px-6 py-2 text-sm font-medium text-gray-deep transition hover:border-gray-deep/50"
        >
          Back to shop
        </Link>
      </div>
    </div>
  );
}
