export const CART_COOKIE_NAME = "verlano_cart_id";

export function getCartIdFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${CART_COOKIE_NAME}=([^;]+)`));
  return match ? match[1].trim() : null;
}
