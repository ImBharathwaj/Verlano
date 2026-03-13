import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: { id: "asc" },
  });
  return NextResponse.json(addresses);
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
  if (
    !name?.trim() ||
    !phone?.trim() ||
    !street?.trim() ||
    !city?.trim() ||
    !state?.trim() ||
    !postalCode?.trim()
  ) {
    return NextResponse.json(
      { error: "name, phone, street, city, state, and postalCode are required" },
      { status: 400 }
    );
  }
  const address = await prisma.address.create({
    data: {
      userId: user.id,
      name: name.trim(),
      phone: phone.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: String(postalCode).trim(),
    },
  });
  return NextResponse.json(address);
}
