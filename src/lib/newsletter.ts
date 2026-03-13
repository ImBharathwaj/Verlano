const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";

/**
 * Add contact to Resend for email marketing. No-op if RESEND_API_KEY is not set.
 * Resend contacts are global; use Resend dashboard to create Broadcasts.
 */
export async function addContactToResend(
  email: string,
  options?: { firstName?: string; lastName?: string }
): Promise<void> {
  if (!RESEND_API_KEY.trim()) return;

  try {
    const res = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        first_name: options?.firstName?.trim() ?? null,
        last_name: options?.lastName?.trim() ?? null,
        unsubscribed: false,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      // 409 = already exists, treat as success
      if (res.status === 409) return;
      console.error("[addContactToResend]", res.status, err);
    }
  } catch (err) {
    console.error("[addContactToResend]", err);
  }
}
