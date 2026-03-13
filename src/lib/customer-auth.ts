import { createHmac } from "node:crypto";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const COOKIE_NAME = "verlano_customer_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  const raw = process.env.AUTH_SECRET ?? process.env.SESSION_SECRET;
  const secret = raw?.trim() ?? "";
  if (secret.length < 16) {
    throw new Error("AUTH_SECRET or SESSION_SECRET (min 16 chars) required for customer auth");
  }
  return secret;
}

function encodePayload(payload: { userId: string; exp: number }): string {
  const secret = getSecret();
  const data = JSON.stringify(payload);
  const b64 = Buffer.from(data, "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

function decodePayload(cookieValue: string): { userId: string; exp: number } | null {
  try {
    const [b64, sig] = cookieValue.split(".");
    if (!b64 || !sig) return null;
    const secret = getSecret();
    const expectedSig = createHmac("sha256", secret).update(b64).digest("base64url");
    if (sig !== expectedSig) return null;
    const data = JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
    if (typeof data.userId !== "string" || typeof data.exp !== "number") return null;
    if (data.exp < Date.now() / 1000) return null;
    return { userId: data.userId, exp: data.exp };
  } catch {
    return null;
  }
}

export function getSessionCookieFromRequest(request: Request): string | null {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1].trim()) : null;
}

export async function getCurrentUserFromCookieValue(
  cookieValue: string | null | undefined,
): Promise<{ id: string; name: string; email: string } | null> {
  if (!cookieValue?.trim()) return null;
  const payload = decodePayload(cookieValue.trim());
  if (!payload) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true },
  });
  return user;
}

export async function getCurrentUserFromNextAuth(): Promise<{ id: string; name: string; email: string } | null> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { userId?: string })?.userId;
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });
  return user;
}

export async function getCurrentUser(request: Request): Promise<{ id: string; name: string; email: string } | null> {
  const nextAuthUser = await getCurrentUserFromNextAuth();
  if (nextAuthUser) return nextAuthUser;
  const value = getSessionCookieFromRequest(request);
  return getCurrentUserFromCookieValue(value);
}

/** Use in Server Components (layout, page) where Request is not available. */
export async function getCurrentUserFromContext(): Promise<{ id: string; name: string; email: string } | null> {
  const nextAuthUser = await getCurrentUserFromNextAuth();
  if (nextAuthUser) return nextAuthUser;
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value ?? null;
  return getCurrentUserFromCookieValue(sessionCookie);
}

export function buildSessionCookie(userId: string): { name: string; value: string; options: Record<string, unknown> } {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const value = encodePayload({ userId, exp });
  return {
    name: COOKIE_NAME,
    value,
    options: {
      path: "/",
      maxAge: MAX_AGE_SEC,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
    },
  };
}

export function clearSessionCookie(): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: COOKIE_NAME,
    value: "",
    options: { path: "/", maxAge: 0, httpOnly: true, sameSite: "lax" as const },
  };
}

export { COOKIE_NAME };
