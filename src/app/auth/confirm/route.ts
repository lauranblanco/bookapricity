import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/resend";
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

// Handles email confirmation links (signup, invite, email change, ...).
//
// This verifies the OTP token embedded in the link directly, instead of
// exchanging a PKCE `code` (the approach `/auth/callback` uses for OAuth).
// A PKCE exchange needs the `code_verifier` cookie that was set in the
// browser that started the sign-up — but confirmation links are routinely
// opened from a different browser/device (a mail app's in-app browser, a
// second tab, a phone), where that cookie was never set. That mismatch
// made every confirmation fail with a generic "expired or already used"
// error within seconds of the email being sent. Verifying the token_hash
// has no such requirement, since it isn't tied to the browser that
// requested it.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (tokenHash && type) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) {
      if (type === "signup" && data.user?.email) {
        sendWelcomeEmail(data.user.email).catch((err) => {
          console.error("Failed to send welcome email:", err);
        });
      }

      const redirectTo = next.startsWith("http") ? next : `${origin}${next}`;
      return NextResponse.redirect(redirectTo);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
