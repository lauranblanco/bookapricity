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
        <h1 className="font-heading text-2xl font-semibold text-tinta">Invite link not found</h1>
        <p className="text-tinta-800">
          This invite link doesn&apos;t match a club. Ask your club admin for a new one.
        </p>
      </main>
    );
  }

  const profile = await getCurrentProfile();

  return (
    <main className="flex min-h-screen items-center justify-center bg-umbral p-7">
      <div className="w-full max-w-md">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[.14em] text-sol">
          You&apos;ve been invited
        </p>
        <h4 className="mt-3 font-heading text-[30px] font-medium tracking-[-.015em] text-crema">
          Join {clubName}
        </h4>
        <p className="mb-[18px] mt-1.5 text-[13.5px] text-[rgba(251,243,228,0.82)]">
          Create your member account and start booking courts.
        </p>

        {!profile && <JoinSignupForm clubId={params.clubId} />}

        {profile && !profile.club_id && <JoinButton clubId={params.clubId} />}

        {profile && profile.club_id === params.clubId && (
          <p className="text-[13.5px] text-[rgba(251,243,228,0.85)]">
            You&apos;re already a member of {clubName}.
          </p>
        )}

        {profile && profile.club_id && profile.club_id !== params.clubId && (
          <p className="text-[13.5px] text-[rgba(251,243,228,0.85)]">
            Your account already belongs to a different club.
          </p>
        )}
      </div>
    </main>
  );
}
