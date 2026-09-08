import { getCurrentProfile } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { LinkButton } from "@/components/Button";

// Illustrative example for the marketing hero — there is no real club at
// this unauthenticated, un-scoped route, so per the brief this stays static
// rather than faking a live number.
const TAKEN_CELLS = new Set([1, 3, 4, 8, 9, 11, 15, 16, 17, 20]);

export default async function Home() {
  const profile = await getCurrentProfile();

  if (profile?.role === "admin") {
    redirect(profile.club_id ? "/dashboard" : "/onboarding/create-club");
  }

  if (profile?.role === "member") {
    redirect("/book");
  }

  return (
    <main className="bg-crema">
      <header className="flex items-center justify-between border-b-2 border-[rgba(42,33,24,0.4)] px-6 py-5 md:px-[34px]">
        <div className="flex items-center gap-2.5">
          <BrandMark variant="color" size={26} />
          <span className="font-heading text-base font-semibold tracking-[-.01em] text-umbral">
            BookApricity
          </span>
          <span className="hidden border-l border-[rgba(42,33,24,0.25)] pl-2.5 font-mono text-[9.5px] uppercase tracking-[.2em] text-tinta-600 sm:inline">
            an umbricity product
          </span>
        </div>
        <div className="flex gap-2.5">
          <LinkButton href="/login" variant="secondary" size="sm">
            Log in
          </LinkButton>
          <LinkButton href="/signup" variant="primary" size="sm">
            Create a club
          </LinkButton>
        </div>
      </header>

      <div className="grid border-b-2 border-[rgba(42,33,24,0.4)] md:grid-cols-[1.15fr_1fr]">
        <div className="border-b-2 border-[rgba(42,33,24,0.4)] px-6 py-10 md:border-b-0 md:border-r-2 md:px-[34px] md:py-[52px]">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[.14em] text-resol-700">
            Booking &amp; membership for clubs
          </p>
          <h1 className="mt-3.5 max-w-[15ch] font-heading text-[40px] font-medium leading-[.98] tracking-[-.02em] text-tinta md:text-[58px]">
            The court is free. Say who&apos;s on it.
          </h1>
          <p className="mt-4 max-w-[46ch] text-base text-tinta-800">
            Set up your resources once, share one invite link, and let members book their own
            slots. Cancellations, capacity and cutoffs handled.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <LinkButton href="/signup" variant="primary" size="lg">
              Create a club
            </LinkButton>
            <LinkButton href="/login" variant="secondary" size="lg">
              Log in
            </LinkButton>
          </div>
          <div className="mt-[34px] flex gap-[26px] border-t border-[rgba(42,33,24,0.2)] pt-4">
            <Stat value="2 min" label="to set up a club" />
            <Stat value="1 link" label="to invite every member" />
            <Stat value="€0" label="until your first booking" />
          </div>
        </div>

        <div className="flex flex-col justify-between bg-umbral px-6 py-10 md:px-[34px]">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[.14em] text-sol">
            This week at Riverside TC
          </p>
          <div className="my-6 grid grid-cols-7 gap-[5px]">
            {Array.from({ length: 21 }, (_, i) => (
              <div
                key={i}
                className="h-6"
                style={{ background: TAKEN_CELLS.has(i) ? "#E2683F" : "rgba(251,243,228,.28)" }}
              />
            ))}
          </div>
          <p className="font-heading text-2xl leading-[1.1] tracking-[-.01em] text-crema">
            47 slots open,
            <br />
            18 already taken.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3">
        <Feature
          title="Resources, your way"
          body="Courts, rooms, equipment — capacity, slot length and cancellation cutoff per resource."
          border
        />
        <Feature
          title="One invite link"
          body="Members join themselves. No spreadsheets, no chasing emails."
          border
        />
        <Feature
          title="Members self-serve"
          body="They book and cancel from their phone. You just watch the list."
        />
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-heading text-xl font-medium text-tinta">{value}</div>
      <div className="text-[11.5px] text-tinta-600">{label}</div>
    </div>
  );
}

function Feature({ title, body, border }: { title: string; body: string; border?: boolean }) {
  return (
    <div
      className={
        border
          ? "border-b border-[rgba(42,33,24,0.2)] px-6 py-6 md:border-b-0 md:border-r md:px-[34px] md:py-[26px]"
          : "px-6 py-6 md:px-[34px] md:py-[26px]"
      }
    >
      <div className="font-heading text-[15px] font-semibold text-tinta">{title}</div>
      <p className="mt-1.5 text-[13px] text-tinta-800">{body}</p>
    </div>
  );
}
