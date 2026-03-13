import { NextResponse } from "next/server";
import { getCurrentUserFromNextAuth } from "@/lib/customer-auth";
import { CART_COOKIE_NAME, getCartIdFromCookie, mergeGuestCartIntoUserCart } from "@/lib/cart";

export const dynamic = "force-dynamic";

/** Called after OAuth sign-in to merge guest cart into user cart. Redirects to ?then= or /account. */
export async function GET(request: Request) {
  const user = await getCurrentUserFromNextAuth();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const guestCartId = getCartIdFromCookie(request.headers.get("cookie"));
  const userCartId = await mergeGuestCartIntoUserCart(guestCartId, user.id);

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("then") ?? "/account";

  const res = NextResponse.redirect(new URL(redirectTo, request.url));
  res.cookies.set(CART_COOKIE_NAME, userCartId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
