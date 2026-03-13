import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login" || pathname === "/api/admin/login";

  if (isAdminLogin) {
    return NextResponse.next();
  }

  const hasAdminSession = request.cookies.get("admin_session")?.value === "1";

  if (isAdminPath && !hasAdminSession) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
