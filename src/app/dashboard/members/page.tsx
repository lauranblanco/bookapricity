import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { CopyInviteLink } from "./CopyInviteLink";
import { MembersTable, type MemberRow } from "./MembersTable";
import { MembersEmptyState } from "./MembersEmptyState";

export default async function MembersPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: members } = await supabase
    .from("users")
    .select("id, email, role, created_at")
    .eq("club_id", profile!.club_id!)
    .order("created_at");

  const { data: club } = await supabase
    .from("clubs")
    .select("invite_token")
    .eq("id", profile!.club_id!)
    .single();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const { data: recentReservations } = await supabase
    .from("reservations")
    .select("member_id")
    .eq("status", "confirmed")
    .gte("start_time", thirtyDaysAgo.toISOString())
    .lte("start_time", new Date().toISOString());

  const bookingCounts = new Map<string, number>();
  for (const reservation of recentReservations ?? []) {
    bookingCounts.set(
      reservation.member_id,
      (bookingCounts.get(reservation.member_id) ?? 0) + 1,
    );
  }

  const rows: MemberRow[] = (members ?? []).map((member) => ({
    id: member.id,
    email: member.email,
    role: member.role,
    joinedAt: member.created_at,
    bookings30d: bookingCounts.get(member.id) ?? 0,
    isYou: member.id === profile!.id,
  }));

  const adminCount = rows.filter((m) => m.role === "admin").length;
  const inviteUrl = `${process.env.SITE_URL}/join/${club?.invite_token}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between border-b-2 border-[rgba(42,33,24,0.4)] pb-3">
        <h2 className="font-heading text-[30px] font-medium tracking-[-.012em] text-tinta">
          Members
        </h2>
        <span className="font-mono text-[11px] font-medium uppercase tracking-[.09em] text-tinta-600">
          {rows.length} members · {adminCount} admins
        </span>
      </div>

      <CopyInviteLink inviteUrl={inviteUrl} />

      {rows.length <= 1 ? (
        <MembersEmptyState inviteUrl={inviteUrl} />
      ) : (
        <MembersTable members={rows} />
      )}
    </div>
  );
}
