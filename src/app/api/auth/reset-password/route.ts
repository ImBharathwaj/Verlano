import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { token, password } = body as { token?: string; password?: string };
    if (!token || typeof token !== "string" || !token.trim()) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token: token.trim() },
      include: { user: true },
    });
    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired reset link. Request a new one." }, { status: 400 });
    }

    const hashed = await hashPassword(password);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashed },
      }),
      prisma.passwordResetToken.delete({ where: { id: resetRecord.id } }),
    ]);

    return NextResponse.json({ message: "Password updated. You can sign in now." });
  } catch (err) {
    console.error("[POST /api/auth/reset-password]", err);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
