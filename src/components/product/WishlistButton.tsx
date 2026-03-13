"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  getWishlistIds,
  addToWishlist,
  removeFromWishlist,
  fetchServerWishlistIds,
  mergeLocalWishlistToServer,
} from "@/lib/wishlist";

type Props = { productId: string };

function dispatchWishlistChange() {
  window.dispatchEvent(new CustomEvent("verlano-wishlist-change"));
}

export function WishlistButton({ productId }: Props) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const refreshSaved = useCallback(async () => {
    const sessionRes = await fetch("/api/auth/session", { credentials: "include" });
    const session = await sessionRes.json().catch(() => ({}));
    const user = session?.user ?? null;
    setIsLoggedIn(!!user);

    if (user) {
      const ids = await fetchServerWishlistIds();
      const localIds = getWishlistIds();
      if (localIds.length > 0) {
        await mergeLocalWishlistToServer();
        const idsAfterMerge = await fetchServerWishlistIds();
        setSaved(idsAfterMerge.includes(productId));
        dispatchWishlistChange();
        return;
      }
      setSaved(ids.includes(productId));
    } else {
      setSaved(getWishlistIds().includes(productId));
    }
  }, [productId]);

  useEffect(() => {
    setMounted(true);
    refreshSaved();
  }, [refreshSaved]);

  useEffect(() => {
    if (!mounted) return;
    const handler = () => {
      if (isLoggedIn) refreshSaved();
      else setSaved(getWishlistIds().includes(productId));
    };
    window.addEventListener("verlano-wishlist-change", handler);
    return () => window.removeEventListener("verlano-wishlist-change", handler);
  }, [mounted, productId, isLoggedIn, refreshSaved]);

  const handleClick = async () => {
    const nextSaved = !saved;
    setSaved(nextSaved);

    if (isLoggedIn) {
      try {
        if (nextSaved) {
          const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
            credentials: "include",
          });
          if (!res.ok) setSaved(false);
        } else {
          const res = await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (!res.ok) setSaved(true);
        }
        dispatchWishlistChange();
      } catch {
        setSaved(!nextSaved);
      }
    } else {
      if (nextSaved) {
        addToWishlist(productId);
      } else {
        removeFromWishlist(productId);
      }
      dispatchWishlistChange();
    }
  };

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Save for later"
        className="rounded-full border border-gray-soft bg-white px-4 py-2 text-xs font-medium text-gray-deep/80"
      >
        Save for later
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        aria-label={saved ? "Remove from saved" : "Save for later"}
        className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
          saved
            ? "border-ink bg-ink text-white"
            : "border-gray-soft bg-white text-gray-deep/80 hover:border-gray-deep"
        }`}
      >
        {saved ? "Saved" : "Save for later"}
      </button>
      <Link
        href="/saved"
        className="text-xs text-gray-deep/70 underline hover:no-underline"
      >
        View saved
      </Link>
    </div>
  );
}
