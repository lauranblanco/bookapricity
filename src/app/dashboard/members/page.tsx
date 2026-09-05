import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { CopyInviteLink } from "./CopyInviteLink";

export default async function MembersPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: members } = await supabase
    .from("users")
    .select("id, email, role, created_at")
    .eq("club_id", profile!.club_id!)
    .order("created_at");

  const inviteUrl = `${process.env.SITE_URL}/join/${profile!.club_id}`;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Members</h1>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Invite link</span>
        <CopyInviteLink inviteUrl={inviteUrl} />
        <p className="text-sm text-gray-600">
          Share this link with people you want to invite to the club.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-gray-200 rounded border border-gray-200">
        {members?.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-4">
            <span>{member.email}</span>
            <span className="text-sm capitalize text-gray-600">{member.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
