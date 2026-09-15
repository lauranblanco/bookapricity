import { Button, Heading, Text } from "@react-email/components";
import { COLORS, EmailLayout, FONT_FAMILY } from "./EmailLayout";

// Supabase — not this app — actually sends this one: it doesn't run React,
// so there's no live `sendConfirmEmail()` call anywhere. Instead, run
// `npm run email:dev`, open ConfirmEmail, switch to the code view, and
// paste the HTML into the Supabase Dashboard's "Confirm signup" email
// template (Authentication > Email Templates). `confirmUrl`'s default is
// already the literal Go-template expression Supabase's template engine
// expects, so the copied HTML works as-is — no substitution step needed.
export function ConfirmEmail({
  siteUrl = "https://bookapricity.com",
  confirmUrl = "{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next={{ .RedirectTo }}",
}: {
  siteUrl?: string;
  confirmUrl?: string;
}) {
  return (
    <EmailLayout siteUrl={siteUrl} preview="Confirm your email to finish setting up BookApricity.">
      <Heading
        as="h1"
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: COLORS.tinta,
          margin: "0 0 10px",
        }}
      >
        Confirm your email
      </Heading>
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 14,
          lineHeight: "22px",
          color: COLORS.tinta800,
          margin: "0 0 22px",
        }}
      >
        Click the button below to confirm your address and finish setting up your BookApricity
        account.
      </Text>
      <Button
        href={confirmUrl}
        style={{
          backgroundColor: COLORS.umbral,
          color: "#FBF3E4",
          fontFamily: FONT_FAMILY,
          fontSize: 13,
          fontWeight: 600,
          padding: "12px 22px",
          textDecoration: "none",
        }}
      >
        Confirm email
      </Button>
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 12,
          lineHeight: "20px",
          color: COLORS.tinta600,
          margin: "22px 0 0",
        }}
      >
        This link is valid for one hour. If you didn&apos;t create a BookApricity account, you can
        ignore this email.
      </Text>
    </EmailLayout>
  );
}

// Local-preview-only override (npm run email:dev) so the logo resolves
// against the app's own dev server instead of the production fallback
// domain — doesn't affect the default used for the real Supabase template.
ConfirmEmail.PreviewProps = { siteUrl: "http://localhost:3000" };

export default ConfirmEmail;
