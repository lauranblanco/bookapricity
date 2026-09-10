"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import { GoogleIcon } from "@/components/GoogleIcon";

export function GoogleSignInButton({
  next = "/",
  intent,
  label = "Continue with Google",
}: {
  next?: string;
  // "admin_signup" tells /auth/callback this button is the "create an
  // account" one (not "log in"), so a brand-new Google user should get
  // the admin role instead of the member default.
  intent?: "admin_signup";
  label?: string;
}) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleClick() {
    setIsRedirecting(true);
    const supabase = createClient();
    const redirectUrl = new URL("/auth/callback", window.location.origin);
    redirectUrl.searchParams.set("next", next);
    if (intent) {
      redirectUrl.searchParams.set("intent", intent);
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl.toString() },
    });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      block
      onClick={handleClick}
      disabled={isRedirecting}
      className="!justify-center"
    >
      <GoogleIcon size={16} />
      {isRedirecting ? "Redirecting…" : label}
    </Button>
  );
}
