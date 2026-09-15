import { Resend } from "resend";
import { WelcomeEmail } from "@/emails/WelcomeEmail";

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

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Welcome to BookApricity",
    react: <WelcomeEmail siteUrl={process.env.SITE_URL} />,
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }
}
