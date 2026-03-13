import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/password-reset-email";

export const dynamic = "force-dynamic";

const TOKEN_EXPIRY_HOURS = 1;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { email } = body as { email?: string };
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user) {
      return NextResponse.json({ message: "If an account exists, we've sent a reset link to that email." });
    }

    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    const sent = await sendPasswordResetEmail(user.email, token);
    if (!sent) {
      return NextResponse.json(
        { error: "Email is not configured. Contact support to reset your password." },
        { status: 503 }
      );
    }
    return NextResponse.json({ message: "If an account exists, we've sent a reset link to that email." });
  } catch (err) {
    console.error("[POST /api/auth/forgot-password]", err);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
