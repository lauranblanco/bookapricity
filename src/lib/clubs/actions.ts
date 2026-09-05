"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createClub(name: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .insert({ name, admin_id: user.id })
    .select("id")
    .single();

  if (clubError || !club) {
    return { error: clubError?.message ?? "Could not create club" };
  }

  const { error: profileError } = await supabase
    .from("users")
    .update({ club_id: club.id })
    .eq("id", user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  redirect("/dashboard");
}

// For a signed-in user with no club yet (e.g. they logged in, rather
// than signing up, from an invite link) to attach themselves to a club.
export async function joinClub(clubId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("club_id")
    .eq("id", user.id)
    .single();

  if (profile?.club_id) {
    return { error: "You already belong to a club" };
  }

  const { error } = await supabase
    .from("users")
    .update({ club_id: clubId })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  redirect("/book");
}
