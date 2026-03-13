"use client";

import { Suspense, useState } from "react";
import Link from "next/link";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong.");
    }
  };

  if (status === "success") {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-gray-soft bg-white px-6 py-8 shadow-sm">
        <h1 className="text-lg font-semibold tracking-tight text-ink">Check your email</h1>
        <p className="mt-2 text-sm text-gray-deep/80">
          If an account exists for that email, we’ve sent a password reset link. It may take a few minutes to arrive.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-ink underline hover:no-underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-gray-soft bg-white px-6 py-8 shadow-sm">
      <h1 className="text-lg font-semibold tracking-tight text-ink">Forgot password?</h1>
      <p className="mt-1 text-xs text-gray-deep/80">
        Enter your email and we’ll send a link to reset your password.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-deep/80">Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-full bg-black py-2.5 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
        >
          {status === "loading" ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-gray-deep/80">
        <Link href="/login" className="font-medium text-ink underline hover:no-underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-sm rounded-2xl border border-gray-soft bg-white px-6 py-8 shadow-sm animate-pulse" />
        }
      >
        <ForgotPasswordForm />
      </Suspense>
    </main>
  );
}
