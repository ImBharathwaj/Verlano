"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!token.trim()) {
      setError("Invalid reset link. Request a new one.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.error ?? "Reset failed.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-gray-soft bg-white px-6 py-8 shadow-sm">
        <h1 className="text-lg font-semibold tracking-tight text-ink">Password updated</h1>
        <p className="mt-2 text-sm text-gray-deep/80">
          You can now sign in with your new password. Redirecting to sign in…
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-ink underline hover:no-underline"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-gray-soft bg-white px-6 py-8 shadow-sm">
        <h1 className="text-lg font-semibold tracking-tight text-ink">Invalid link</h1>
        <p className="mt-2 text-sm text-gray-deep/80">
          This reset link is missing or invalid. Request a new one from the sign in page.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block text-sm font-medium text-ink underline hover:no-underline"
        >
          Forgot password
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-gray-soft bg-white px-6 py-8 shadow-sm">
      <h1 className="text-lg font-semibold tracking-tight text-ink">Set new password</h1>
      <p className="mt-1 text-xs text-gray-deep/80">
        Enter your new password below.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-deep/80">New password</label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-deep/80">Confirm password</label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-black py-2.5 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
        >
          {loading ? "Updating…" : "Update password"}
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

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-sm rounded-2xl border border-gray-soft bg-white px-6 py-8 shadow-sm animate-pulse" />
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
