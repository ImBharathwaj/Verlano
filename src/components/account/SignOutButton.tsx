"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-full border border-gray-deep/30 px-4 py-2 text-sm font-medium text-gray-deep/90 hover:bg-gray-soft/50"
    >
      Sign out
    </button>
  );
}
