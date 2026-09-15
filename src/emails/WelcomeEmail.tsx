import { Button, Heading, Text } from "@react-email/components";
import { COLORS, EmailLayout, FONT_FAMILY } from "./EmailLayout";

export function WelcomeEmail({ siteUrl = "https://bookapricity.com" }: { siteUrl?: string }) {
  return (
    <EmailLayout siteUrl={siteUrl} preview="Your BookApricity account is confirmed and ready to go.">
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
        You&apos;re all set
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
        Your account is confirmed and ready to go — you can log in and start booking whenever you
        like.
      </Text>
      <Button
        href={siteUrl}
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
        Go to BookApricity
      </Button>
    </EmailLayout>
  );
}

// Local-preview-only override (npm run email:dev) so the logo resolves
// against the app's own dev server instead of the production fallback
// domain — doesn't affect the default used by real sends.
WelcomeEmail.PreviewProps = { siteUrl: "http://localhost:3000" };

export default WelcomeEmail;
