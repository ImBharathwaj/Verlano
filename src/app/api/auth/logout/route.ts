import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

const NEXTAUTH_COOKIES = ["next-auth.session-token", "__Secure-next-auth.session-token"];

export async function POST() {
  const cookie = clearSessionCookie();
  const res = NextResponse.json({ success: true });
  res.cookies.set(cookie.name, cookie.value, cookie.options as Record<string, string | number | boolean>);
  for (const name of NEXTAUTH_COOKIES) {
    res.cookies.set(name, "", { path: "/", maxAge: 0, httpOnly: true, sameSite: "lax" });
  }
  return res;
}
