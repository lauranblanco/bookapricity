import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  email: string;
  role: "admin" | "member";
  club_id: string | null;
};

// The current signed-in user's app profile (role + club), or null if
// there's no session. Used to gate admin/member-only pages and scope
// queries to the caller's own club.
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("id, email, role, club_id")
    .eq("id", user.id)
    .single();

  return data as Profile | null;
}
