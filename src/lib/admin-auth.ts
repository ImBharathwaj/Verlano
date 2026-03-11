import { NextResponse } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export function requireAdmin(request: Request) {
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

