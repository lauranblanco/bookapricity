const RESEND_API_URL = "https://api.resend.com/emails";

// Sent once, right after a member's email is confirmed — separate from
// Supabase's own confirmation email, so the user gets explicit
// confirmation that their account is live rather than wondering whether
// anything happened after they clicked the link.
export async function sendWelcomeEmail(to: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn("RESEND_API_KEY or EMAIL_FROM not set — skipping welcome email");
    return;
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Welcome to BookApricity",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="font-size: 20px;">You're all set</h1>
          <p>Your BookApricity account is confirmed and ready to go.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API error (${response.status}): ${body}`);
  }
}
