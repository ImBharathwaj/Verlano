"use client";

type Props = {
  status?: string;
  errorMessage?: string;
};

export function NewsletterSignup({ status, errorMessage }: Props) {
  const success = status === "subscribed";
  const error = status === "error";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.24em] text-gray-deep/70">
          Early access
        </p>
        <p className="text-sm text-gray-deep/80">
          Be the first to know about new surplus drops and private sales.
        </p>
        {success && (
          <p className="text-sm font-medium text-green-700">
            You&apos;re on the list. We&apos;ll be in touch.
          </p>
        )}
        {error && (
          <p className="text-sm font-medium text-red-600">
            {errorMessage ?? "Something went wrong. Please try again."}
          </p>
        )}
      </div>
      <form
        className="flex w-full max-w-md gap-3"
        action="/api/newsletter"
        method="post"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="h-10 flex-1 rounded-full border border-gray-soft bg-white px-4 text-sm outline-none ring-0 focus:border-ink"
        />
        <button
          type="submit"
          className="h-10 rounded-full bg-ink px-5 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-ink/90"
        >
          Get access
        </button>
      </form>
    </div>
  );
}
