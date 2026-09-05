import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { JoinButton } from "./JoinButton";
import { JoinSignupForm } from "./JoinSignupForm";

export default async function JoinPage({
  params,
}: {
  params: { clubId: string };
}) {
  const supabase = createClient();
  const { data: clubName } = await supabase.rpc("get_club_name", {
    p_club_id: params.clubId,
  });

  if (!clubName) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4">
        <h1 className="text-2xl font-semibold">Invite link not found</h1>
        <p className="text-gray-600">
          This invite link doesn&apos;t match a club. Ask your club admin for a
          new one.
        </p>
      </main>
    );
  }

  const profile = await getCurrentProfile();

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold">Join {clubName}</h1>
      </div>

      {!profile && <JoinSignupForm clubId={params.clubId} />}

      {profile && !profile.club_id && <JoinButton clubId={params.clubId} />}

      {profile && profile.club_id === params.clubId && (
        <p className="text-gray-700">You&apos;re already a member of {clubName}.</p>
      )}

      {profile && profile.club_id && profile.club_id !== params.clubId && (
        <p className="text-gray-700">
          Your account already belongs to a different club.
        </p>
      )}
    </main>
  );
}
