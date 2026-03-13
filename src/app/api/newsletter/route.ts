import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addContactToResend } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const isFormSubmit = contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data");
    let email: string;

    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => null);
      if (!body || typeof body !== "object") {
        return NextResponse.json({ error: "Invalid body" }, { status: 400 });
      }
      email = (body.email ?? "").trim();
    } else {
      const formData = await request.formData();
      email = (formData.get("email") ?? "").toString().trim();
    }

    if (!email) {
      if (isFormSubmit) {
        const referrer = request.headers.get("referer") ?? "/";
        return NextResponse.redirect(`${referrer}?newsletter=error&msg=${encodeURIComponent("Email is required")}`);
      }
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      if (isFormSubmit) {
        const referrer = request.headers.get("referer") ?? "/";
        return NextResponse.redirect(`${referrer}?newsletter=error&msg=${encodeURIComponent("Invalid email address")}`);
      }
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const source = (request.headers.get("x-newsletter-source") ?? "homepage").toLowerCase();

    await prisma.newsletterSubscriber.upsert({
      where: { email: normalizedEmail },
      create: { email: normalizedEmail, source },
      update: { source },
    });

    addContactToResend(normalizedEmail).catch(() => {});

    if (isFormSubmit) {
      const referrer = request.headers.get("referer") ?? "/";
      const base = referrer.split("?")[0];
      return NextResponse.redirect(`${base}?newsletter=subscribed`);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/newsletter]", err);
    const isFormSubmit = (request.headers.get("content-type") ?? "").includes("form");
    if (isFormSubmit) {
      const referrer = request.headers.get("referer") ?? "/";
      return NextResponse.redirect(`${referrer}?newsletter=error&msg=${encodeURIComponent("Subscription failed")}`);
    }
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}
