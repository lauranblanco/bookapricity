import { getCurrentProfile } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { CreateClubForm } from "./CreateClubForm";

export default async function CreateClubPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.club_id) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold">Create your club</h1>
        <p className="mt-1 text-sm text-gray-600">
          You&apos;ll be able to add bookable resources and invite members next.
        </p>
      </div>
      <CreateClubForm />
    </main>
  );
}
