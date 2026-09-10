"use server";

import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdminProfile() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin" || !profile.club_id) {
    return null;
  }
  return profile;
}

async function countOtherAdmins(clubId: string, excludingUserId: string) {
  const supabase = createClient();
  const { count } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("club_id", clubId)
    .eq("role", "admin")
    .neq("id", excludingUserId);
  return count ?? 0;
}

export async function updateMemberRole(memberId: string, role: "admin" | "member") {
  const profile = await requireAdminProfile();

  if (!profile) {
    return { error: "Not authorized" };
  }

  if (memberId === profile.id) {
    return { error: "You can't change your own role" };
  }

  if (role === "member") {
    const otherAdmins = await countOtherAdmins(profile.club_id!, memberId);
    if (otherAdmins === 0) {
      return { error: "The club needs at least one admin. Promote someone else first." };
    }
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", memberId)
    .eq("club_id", profile.club_id!);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/members");
  return {};
}

// Removing a member sets their club_id to null (the same field joinClub
// sets when they join) rather than deleting their account, and cancels
// their upcoming confirmed reservations first — the confirmation dialog
// on the client tells the admin this will happen.
export async function removeMember(memberId: string) {
  const profile = await requireAdminProfile();

  if (!profile) {
    return { error: "Not authorized" };
  }

  if (memberId === profile.id) {
    return { error: "You can't remove yourself" };
  }

  const supabase = createClient();

  const { data: target } = await supabase
    .from("users")
    .select("role")
    .eq("id", memberId)
    .eq("club_id", profile.club_id!)
    .single();

  if (!target) {
    return { error: "Member not found" };
  }

  if (target.role === "admin") {
    const otherAdmins = await countOtherAdmins(profile.club_id!, memberId);
    if (otherAdmins === 0) {
      return { error: "The club needs at least one admin. Promote someone else first." };
    }
  }

  await supabase
    .from("reservations")
    .update({ status: "cancelled" })
    .eq("member_id", memberId)
    .eq("status", "confirmed")
    .gte("start_time", new Date().toISOString());

  const { error } = await supabase.rpc("admin_remove_member", { p_member_id: memberId });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard");
  return {};
}

// Regenerating the invite link swaps the club's invite_token — the old
// token stops resolving to a club (see get_club_by_invite_token), so any
// previously shared link stops working without changing the club id
// itself.
export async function regenerateInviteLink() {
  const profile = await requireAdminProfile();

  if (!profile) {
    return { error: "Not authorized" };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("clubs")
    .update({ invite_token: crypto.randomUUID() })
    .eq("id", profile.club_id!)
    .select("invite_token")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Could not regenerate the invite link" };
  }

  revalidatePath("/dashboard/members");
  return { inviteToken: data.invite_token as string };
}
