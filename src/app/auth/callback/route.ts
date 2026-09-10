import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

// Handles the redirect Supabase sends after an OAuth sign-in (Google).
// Email confirmation links go through /auth/confirm instead — a PKCE
// `code` exchange like this one needs the code_verifier cookie set in the
// browser that started the request, which holds for an OAuth redirect
// (same browser throughout) but not for an emailed link opened elsewhere.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const intent = searchParams.get("intent");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (intent === "admin_signup") {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Google sign-up has no equivalent of signUp()'s `data: { role }`
          // metadata, so the new-user trigger always creates a "member"
          // row. Promote it to admin here — but only if the account still
          // looks untouched (fresh member, no club), so this can't be used
          // to escalate an existing member's role after the fact.
          await supabase
            .from("users")
            .update({ role: "admin" })
            .eq("id", user.id)
            .eq("role", "member")
            .is("club_id", null);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
