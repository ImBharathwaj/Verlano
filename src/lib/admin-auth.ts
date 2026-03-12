import { NextResponse } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function hasAdminCookie(request: Request) {
  const cookie = request.headers.get("cookie");
  if (!cookie) return false;
  return /admin_session=1/.test(cookie);
}

export function requireAdmin(request: Request) {
  // Allow when admin session cookie is present.
  if (hasAdminCookie(request)) {
    return null;
  }

  // Fallback to header-based secret (useful for CLI tools or when no cookie yet).
  if (!ADMIN_SECRET) {
    // If no secret is configured, allow all (useful in local dev).
    return null;
  }

  const header = request.headers.get("x-admin-secret");
  if (!header || header !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

