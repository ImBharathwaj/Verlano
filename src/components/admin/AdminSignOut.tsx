"use client";

import { useRouter } from "next/navigation";

export function AdminSignOut() {
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    router.push("/admin/login");
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="mt-6 block text-sm text-gray-deep/70 hover:text-black"
    >
      Sign out
    </button>
  );
}
