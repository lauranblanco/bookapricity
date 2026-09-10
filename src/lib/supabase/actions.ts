"use server";

import { createClient } from "@/lib/supabase/server";

export type UserRole = "admin" | "member";

export async function signUpWithRole(
  email: string,
  password: string,
  role: UserRole,
  options?: { clubId?: string; next?: string },
) {
  const supabase = createClient();

  // The "Confirm signup" email template points here with a token_hash
  // (see /auth/confirm) and carries this value through as `next`, so it
  // must be the final destination, not an intermediate route.
  const emailRedirectTo = new URL(options?.next ?? "/", process.env.SITE_URL).toString();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, club_id: options?.clubId },
      emailRedirectTo,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Supabase returns a 200 with a user object even when the email is
  // already registered (to avoid leaking which emails exist) — but sends
  // no confirmation email in that case. An empty `identities` array is
  // the documented signal that this "signup" actually matched an
  // existing account.
  if (data.user && data.user.identities?.length === 0) {
    return { alreadyRegistered: true as const };
  }

  // With email confirmation required (the default), signUp does not
  // return an active session — the caller must confirm via email first.
  return { data, needsEmailConfirmation: !data.session };
}

export async function resendSignupConfirmation(email: string, next?: string) {
  const supabase = createClient();

  const emailRedirectTo = new URL(next ?? "/", process.env.SITE_URL).toString();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo },
  });

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
