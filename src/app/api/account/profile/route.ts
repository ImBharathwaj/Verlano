import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, phone: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(profile);
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { name, email, phone } = body as { name?: string; email?: string; phone?: string | null };
  const updates: { name?: string; email?: string; phone?: string | null } = {};
  if (typeof name === "string" && name.trim()) {
    updates.name = name.trim();
  }
  if (typeof email === "string" && email.trim()) {
    const normalized = email.trim().toLowerCase();
    const existing = await prisma.user.findFirst({
      where: { email: normalized, id: { not: user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    updates.email = normalized;
  }
  if (phone !== undefined) {
    updates.phone = typeof phone === "string" && phone.trim() ? phone.trim() : null;
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updates,
    select: { id: true, name: true, email: true, phone: true },
  });
  return NextResponse.json(updated);
}
