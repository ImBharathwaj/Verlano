import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    return NextResponse.json(user ? { user } : { user: null });
  } catch {
    return NextResponse.json({ user: null });
  }
}
