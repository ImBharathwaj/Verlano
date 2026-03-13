import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const RESEND_FROM = process.env.RESEND_FROM ?? "Verlano <onboarding@resend.dev>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://verlano.com";

/**
 * Send password reset link to the user. No-op if RESEND_API_KEY is not set.
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  if (!RESEND_API_KEY.trim()) {
    return false;
  }
  try {
    const resetUrl = `${SITE_URL.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(resetToken)}`;
    const html = `
      <h2>Reset your password</h2>
      <p>We received a request to reset the password for your Verlano account.</p>
      <p><a href="${resetUrl}">Reset password</a></p>
      <p>This link expires in 1 hour. If you didn’t request this, you can ignore this email.</p>
    `;
    const resend = new Resend(RESEND_API_KEY.trim());
    await resend.emails.send({
      from: RESEND_FROM,
      to: [email.trim()],
      subject: "Reset your password — Verlano",
      html,
    });
    return true;
  } catch (err) {
    console.error("[sendPasswordResetEmail]", err);
    return false;
  }
}
