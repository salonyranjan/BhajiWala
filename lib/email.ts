type EmailResult = { sent: true } | { sent: false; reason: string };

function recipients(value: string) {
  return value.split(",").map(email => email.trim()).filter(Boolean);
}

/** Sends an operational email without allowing an email outage to lose an order. */
export async function sendOperationalEmail(input: { subject: string; text: string; idempotencyKey: string }): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.ORDER_FROM_EMAIL?.trim();
  const to = recipients(process.env.ORDER_NOTIFICATION_EMAIL ?? "");
  if (!apiKey || !from || to.length === 0) return { sent: false, reason: "Email notifications are not configured." };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": input.idempotencyKey },
      body: JSON.stringify({ from, to, subject: input.subject, text: input.text }),
      signal: AbortSignal.timeout(10_000),
    });
    if (response.ok) return { sent: true };
    const body = await response.text();
    console.error("Resend email request failed", { status: response.status, body: body.slice(0, 500) });
    return { sent: false, reason: "The email provider rejected the notification." };
  } catch (error) {
    console.error("Resend email request failed", error);
    return { sent: false, reason: "The email provider could not be reached." };
  }
}
