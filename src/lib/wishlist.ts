const WISHLIST_KEY = "verlano_wishlist";

export function getWishlistIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function setWishlistIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent("verlano-wishlist-change", { detail: { ids } }));
  } catch {
    // ignore
  }
}

export function addToWishlist(productId: string): void {
  const ids = getWishlistIds();
  if (ids.includes(productId)) return;
  setWishlistIds([...ids, productId]);
}

export function removeFromWishlist(productId: string): void {
  setWishlistIds(getWishlistIds().filter((id) => id !== productId));
}

export function toggleWishlist(productId: string): boolean {
  const ids = getWishlistIds();
  const isSaved = ids.includes(productId);
  if (isSaved) {
    removeFromWishlist(productId);
    return false;
  }
  addToWishlist(productId);
  return true;
}

export function isInWishlist(productId: string): boolean {
  return getWishlistIds().includes(productId);
}

/** Merge localStorage wishlist into server (call when user is logged in). Clears localStorage after. */
export async function mergeLocalWishlistToServer(): Promise<void> {
  const localIds = getWishlistIds();
  if (localIds.length === 0) return;
  for (const productId of localIds) {
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
        credentials: "include",
      });
    } catch {
      // ignore per-item errors
    }
  }
  setWishlistIds([]);
}

export async function fetchServerWishlistIds(): Promise<string[]> {
  const res = await fetch("/api/wishlist", { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  return Array.isArray(data?.productIds) ? data.productIds : [];
}
