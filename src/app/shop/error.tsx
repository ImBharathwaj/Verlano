"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ShopError({
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
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 py-12 text-center">
      <h2 className="text-lg font-semibold tracking-tight text-black">
        Couldn’t load the shop
      </h2>
      <p className="mt-2 max-w-md text-sm text-gray-deep/80">
        Something went wrong loading products. Try again or go back home.
      </p>
      <div className="mt-6 flex gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-ink bg-ink px-5 py-2 text-sm font-medium text-white transition hover:bg-ink/90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-gray-deep/30 px-5 py-2 text-sm font-medium text-gray-deep transition hover:border-gray-deep/50"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
