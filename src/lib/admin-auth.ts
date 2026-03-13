import { NextResponse } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function hasAdminCookie(request: Request) {
  const cookie = request.headers.get("cookie");
  if (!cookie) return false;
  return /admin_session=1/.test(cookie);
}

export function requireAdmin(request: Request) {
  // Allow when admin session cookie is present (browser login).
  if (hasAdminCookie(request)) {
    return null;
  }

  // Allow when env-based secret is set and request sends it (CLI / server-to-server).
  if (ADMIN_SECRET) {
    const header = request.headers.get("x-admin-secret");
    if (header === ADMIN_SECRET) {
      return null;
    }
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

