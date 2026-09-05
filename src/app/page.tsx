import { getCurrentProfile } from "@/lib/supabase/queries";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const profile = await getCurrentProfile();

  if (profile?.role === "admin") {
    redirect(profile.club_id ? "/dashboard" : "/onboarding/create-club");
  }

  if (profile?.role === "member") {
    redirect("/book");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4 text-center">
      <h1 className="text-3xl font-semibold">BookApricity</h1>
      <p className="text-gray-600">
        Booking and membership management for clubs and associations.
      </p>
      <div className="flex flex-col gap-3">
        <Link
          href="/signup"
          className="rounded bg-gray-900 px-4 py-2 text-white"
        >
          Create a club
        </Link>
        <Link href="/login" className="rounded border border-gray-300 px-4 py-2">
          Log in
        </Link>
      </div>
    </main>
  );
}
