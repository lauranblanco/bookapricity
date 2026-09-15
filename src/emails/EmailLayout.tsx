import {
  Body,
  Column,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

// Brand tokens copied from tailwind.config.ts — email clients don't load
// our Tailwind build, so these are duplicated on purpose rather than
// imported.
export const COLORS = {
  crema: "#FBF3E4",
  cremaLine: "rgba(42,33,24,0.2)",
  umbral: "#35486B",
  tinta: "#2A2118",
  tinta800: "#4A4136",
  tinta600: "#7A6E5D",
  resol: "#E2683F",
};

export const FONT_FAMILY = "Figtree, Helvetica, Arial, sans-serif";

export function EmailLayout({
  siteUrl = "https://bookapricity.com",
  preview,
  children,
}: {
  siteUrl?: string;
  preview: string;
  children: ReactNode;
}) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Figtree"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.gstatic.com/s/figtree/v11/_Xmz-HUzqDCFdgfMuVfSCduU7RwPog.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: COLORS.crema, margin: 0, padding: "32px 16px" }}>
        <Container
          style={{
            maxWidth: 480,
            margin: "0 auto",
            backgroundColor: "#FFFFFF",
            border: `1px solid ${COLORS.cremaLine}`,
          }}
        >
          <Section style={{ padding: "28px 28px 0" }}>
            <Row>
              <Column style={{ width: 34 }}>
                <Img
                  src={`${siteUrl}/brand/mark-email.png`}
                  width={26}
                  height={26}
                  alt=""
                  style={{ display: "block" }}
                />
              </Column>
              <Column>
                <Text
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    color: COLORS.umbral,
                    margin: 0,
                  }}
                >
                  BookApricity
                </Text>
              </Column>
            </Row>
            <Text
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 9.5,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: COLORS.tinta600,
                margin: "6px 0 0",
              }}
            >
              an umbricity product
            </Text>
          </Section>

          <Section style={{ padding: "22px 28px 0" }}>{children}</Section>

          <Hr style={{ borderColor: COLORS.cremaLine, margin: "28px 0 0" }} />

          <Section style={{ padding: "16px 28px 24px" }}>
            <Text
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 11.5,
                color: COLORS.tinta600,
                margin: 0,
              }}
            >
              You&apos;re getting this because of activity on a BookApricity account. If that
              wasn&apos;t you, you can ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
