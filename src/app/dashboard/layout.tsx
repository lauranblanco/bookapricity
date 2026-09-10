import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";
import { BrandMark } from "@/components/BrandMark";
import { AdminNavTabs, type NavTabItem } from "@/components/NavTabs";
import { Badge, type BadgeTone } from "@/components/Badge";
import { redirect } from "next/navigation";

const NAV_ITEMS: NavTabItem[] = [
  { href: "/dashboard", label: "Reservations", shortLabel: "Reserv." },
  { href: "/dashboard/resources", label: "Resources", shortLabel: "Resour." },
  { href: "/dashboard/members", label: "Members" },
  { href: "/dashboard/billing", label: "Billing" },
];

const PLAN_BADGE: Record<string, { label: string; tone: BadgeTone }> = {
  active: { label: "Plan active", tone: "planActive" },
  past_due: { label: "Past due", tone: "pastDue" },
  inactive: { label: "Inactive", tone: "inactive" },
  cancelled: { label: "Cancelled plan", tone: "cancelledPlan" },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin") {
    redirect("/book");
  }

  if (!profile.club_id) {
    redirect("/onboarding/create-club");
  }

  const supabase = createClient();
  const { data: club } = await supabase
    .from("clubs")
    .select("subscription_status")
    .eq("id", profile.club_id)
    .single();

  const plan = PLAN_BADGE[club?.subscription_status ?? "inactive"] ?? PLAN_BADGE.inactive;

  return (
    <div className="min-h-screen bg-crema">
      <header className="bg-umbral">
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:mx-auto md:h-[58px] md:max-w-6xl md:px-6 md:py-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <BrandMark variant="negative" size={24} />
              <span className="font-heading text-sm font-semibold tracking-[-.01em] text-crema">
                BookApricity
              </span>
            </div>
            <div className="hidden md:block">
              <AdminNavTabs items={NAV_ITEMS} layout="desktop" />
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <Badge tone={plan.tone}>{plan.label}</Badge>
            <span className="hidden truncate text-xs text-[rgba(251,243,228,0.7)] sm:inline">
              {profile.email}
            </span>
            <SignOutButton variant="outlineInverse" />
          </div>
        </div>
        <div className="md:hidden">
          <AdminNavTabs items={NAV_ITEMS} layout="mobile" />
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
