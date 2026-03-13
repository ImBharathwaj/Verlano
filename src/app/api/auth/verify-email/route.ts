import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid-verification", request.url));
  }

  try {
    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record || record.expiresAt < new Date()) {
      return NextResponse.redirect(new URL("/login?error=expired-verification", request.url));
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      prisma.emailVerificationToken.delete({ where: { id: record.id } }),
    ]);

    const base = new URL(request.url).origin;
    return NextResponse.redirect(`${base}/account?verified=1`);
  } catch (err) {
    console.error("[GET /api/auth/verify-email]", err);
    return NextResponse.redirect(new URL("/login?error=verification-failed", request.url));
  }
}
