import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { buildSessionCookie } from "@/lib/customer-auth";
import { sendVerificationEmail } from "@/lib/verification-email";

export const dynamic = "force-dynamic";

const TOKEN_EXPIRY_HOURS = 24;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { name, email, password } = body as { name?: string; email?: string; password?: string };
    if (!name?.trim() || !email?.trim() || !password || typeof password !== "string") {
      return NextResponse.json(
        { error: "name, email and password are required" },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
    }
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashed,
      },
    });
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
    await prisma.emailVerificationToken.create({
      data: { userId: user.id, token, expiresAt },
    });
    sendVerificationEmail(normalizedEmail, token).catch(() => {});
    const cookie = buildSessionCookie(user.id);
    const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    res.cookies.set(cookie.name, cookie.value, cookie.options as Record<string, string | number | boolean>);
    return res;
  } catch (err) {
    if (String(err).includes("AUTH_SECRET")) {
      return NextResponse.json(
        {
          error:
            "Server auth not configured. Set AUTH_SECRET in .env to at least 16 characters, then restart the dev server (npm run dev).",
        },
        { status: 503 },
      );
    }
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
