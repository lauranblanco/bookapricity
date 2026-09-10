import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";
import { BrandMark } from "@/components/BrandMark";
import { MemberNavTabs, type NavTabItem } from "@/components/NavTabs";
import { MobileNavMenu } from "@/components/MobileNavMenu";
import { redirect } from "next/navigation";

const NAV_ITEMS: NavTabItem[] = [
  { href: "/book", label: "Book a slot" },
  { href: "/my-reservations", label: "My reservations" },
];

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.club_id) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4">
        <h1 className="font-heading text-2xl font-semibold text-tinta">No club yet</h1>
        <p className="text-tinta-800">
          Ask your club admin for an invite link to join a club.
        </p>
        <SignOutButton />
      </main>
    );
  }

  const supabase = createClient();
  const { data: club } = await supabase
    .from("clubs")
    .select("name")
    .eq("id", profile.club_id)
    .single();

  return (
    <div className="min-h-screen bg-crema">
      <header className="relative border-b-2 border-umbral bg-crema">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:h-[58px] md:px-6 md:py-0">
          <div className="flex min-w-0 items-center gap-3 md:gap-6">
            <MobileNavMenu items={NAV_ITEMS} theme="light" />
            <div className="flex min-w-0 items-center gap-2">
              <BrandMark variant="color" size={24} />
              <span className="truncate font-heading text-sm font-semibold tracking-[-.01em] text-tinta">
                {club?.name ?? "BookApricity"}
              </span>
            </div>
            <div className="hidden md:block">
              <MemberNavTabs items={NAV_ITEMS} />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3.5">
            <span className="hidden truncate text-xs text-tinta-600 sm:inline">{profile.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
