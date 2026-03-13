import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { name, phone, street, city, state, postalCode } = body as {
    name?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  const updates: { name?: string; phone?: string; street?: string; city?: string; state?: string; postalCode?: string } = {};
  if (typeof name === "string" && name.trim()) updates.name = name.trim();
  if (typeof phone === "string" && phone.trim()) updates.phone = phone.trim();
  if (typeof street === "string" && street.trim()) updates.street = street.trim();
  if (typeof city === "string" && city.trim()) updates.city = city.trim();
  if (typeof state === "string" && state.trim()) updates.state = state.trim();
  if (typeof postalCode === "string" && postalCode.trim()) updates.postalCode = postalCode.trim();
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }
  const address = await prisma.address.findFirst({
    where: { id, userId: user.id },
  });
  if (!address) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }
  const updated = await prisma.address.update({
    where: { id },
    data: updates,
  });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: Params) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const address = await prisma.address.findFirst({
    where: { id, userId: user.id },
  });
  if (!address) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }
  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
