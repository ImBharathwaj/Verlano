import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { buildSessionCookie } from "@/lib/customer-auth";
import { CART_COOKIE_NAME, getCartIdFromCookie, mergeGuestCartIntoUserCart } from "@/lib/cart";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { email, password } = body as { email?: string; password?: string };
    if (!email?.trim() || !password || typeof password !== "string") {
      return NextResponse.json({ error: "email and password are required" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    if (!user.password) {
      return NextResponse.json(
        { error: "This account uses Google sign-in. Please sign in with Google." },
        { status: 401 },
      );
    }
    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const guestCartId = getCartIdFromCookie(request.headers.get("cookie"));
    const userCartId = await mergeGuestCartIntoUserCart(guestCartId, user.id);

    const cookie = buildSessionCookie(user.id);
    const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    res.cookies.set(cookie.name, cookie.value, cookie.options as Record<string, string | number | boolean>);
    if (userCartId) {
      res.cookies.set(CART_COOKIE_NAME, userCartId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return res;
  } catch (err) {
    if (String(err).includes("AUTH_SECRET")) {
      return NextResponse.json({ error: "Server auth not configured" }, { status: 503 });
    }
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
