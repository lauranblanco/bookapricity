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

  const redirectUrl = new URL(`${process.env.SITE_URL}/auth/callback`);
  if (options?.next) {
    redirectUrl.searchParams.set("next", options.next);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, club_id: options?.clubId },
      emailRedirectTo: redirectUrl.toString(),
    },
  });

  if (error) {
    return { error: error.message };
  }

  // With email confirmation required (the default), signUp does not
  // return an active session — the caller must confirm via email first.
  return { data, needsEmailConfirmation: !data.session };
}

export async function resendSignupConfirmation(email: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.resend({ type: "signup", email });

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
