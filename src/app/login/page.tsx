"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useCart } from "@/contexts/CartContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshCart } = useCart();
  const redirect = searchParams.get("redirect") ?? "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = () => {
    const callbackUrl = `/api/auth/merge-cart?then=${encodeURIComponent(redirect)}`;
    signIn("google", { callbackUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign in failed");
      } else {
        await refreshCart();
        router.push(redirect);
      }
    } catch {
      setError("Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-2xl border border-gray-soft bg-white px-6 py-8 shadow-sm">
        <h1 className="text-lg font-semibold tracking-tight text-ink">Sign in</h1>
        <p className="mt-1 text-xs text-gray-deep/80">
          Sign in to your account to view orders and saved details.
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
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium text-gray-deep/80">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-ink underline hover:no-underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-soft bg-white px-3 py-2 text-sm text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-soft bg-white py-2.5 text-sm font-medium text-ink hover:bg-gray-soft/30"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-soft" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-deep/70">or</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-black py-2.5 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-deep/80">
          Don’t have an account?{" "}
          <Link href="/signup" className="font-medium text-ink underline hover:no-underline">
            Sign up
          </Link>
        </p>
      </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center py-12">
      <Suspense fallback={<div className="w-full max-w-sm rounded-2xl border border-gray-soft bg-white px-6 py-8 shadow-sm animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
