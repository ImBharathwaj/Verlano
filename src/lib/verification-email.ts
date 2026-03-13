import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const RESEND_FROM = process.env.RESEND_FROM ?? "Verlano <onboarding@resend.dev>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://verlano.com";

/**
 * Send email verification link. No-op if RESEND_API_KEY is not set.
 */
export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  if (!RESEND_API_KEY.trim()) {
    return false;
  }
  try {
    const verifyUrl = `${SITE_URL.replace(/\/$/, "")}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
    const html = `
      <h2>Confirm your email</h2>
      <p>Thanks for signing up at Verlano. Please confirm your email address.</p>
      <p><a href="${verifyUrl}">Confirm email</a></p>
      <p>This link expires in 24 hours. If you didn’t create an account, you can ignore this email.</p>
    `;
    const resend = new Resend(RESEND_API_KEY.trim());
    await resend.emails.send({
      from: RESEND_FROM,
      to: [email.trim()],
      subject: "Confirm your email — Verlano",
      html,
    });
    return true;
  } catch (err) {
    console.error("[sendVerificationEmail]", err);
    return false;
  }
}
