import { getCurrentProfile } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { CreateClubForm } from "./CreateClubForm";
import { AuthCard } from "@/components/AuthCard";

export default async function CreateClubPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.club_id) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <AuthCard>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[.1em] text-resol-700">
          Welcome to BookApricity
        </p>
        <h4 className="mb-[18px] mt-[10px] font-heading text-[26px] font-medium tracking-[-.015em] text-tinta">
          Name your club
        </h4>
        <CreateClubForm />
        <hr className="my-4 border-[rgba(42,33,24,0.15)]" />
        <div className="flex flex-col gap-2">
          <NextStep number="01" text="Add your first resource" active />
          <NextStep number="02" text="Share the invite link" />
          <NextStep number="03" text="Activate your plan" />
        </div>
      </AuthCard>
    </main>
  );
}

function NextStep({ number, text, active }: { number: string; text: string; active?: boolean }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span
        className={`font-heading text-xs font-semibold ${active ? "text-resol" : "text-tinta-600"}`}
      >
        {number}
      </span>
      <span className={`text-[13px] ${active ? "text-tinta" : "text-tinta-800"}`}>{text}</span>
    </div>
  );
}
