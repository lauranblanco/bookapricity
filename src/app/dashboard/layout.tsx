import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";
import { BrandMark } from "@/components/BrandMark";
import { AdminNavTabs, type NavTabItem } from "@/components/NavTabs";
import { Badge, type BadgeTone } from "@/components/Badge";
import { redirect } from "next/navigation";

const NAV_ITEMS: NavTabItem[] = [
  { href: "/dashboard", label: "Reservations" },
  { href: "/dashboard/resources", label: "Resources" },
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
        <div className="mx-auto flex h-[58px] max-w-6xl items-stretch justify-between px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <BrandMark variant="negative" size={24} />
              <span className="font-heading text-sm font-semibold tracking-[-.01em] text-crema">
                BookApricity
              </span>
            </div>
            <AdminNavTabs items={NAV_ITEMS} />
          </div>
          <div className="flex items-center gap-3.5">
            <Badge tone={plan.tone}>{plan.label}</Badge>
            <span className="text-xs text-[rgba(251,243,228,0.7)]">{profile.email}</span>
            <SignOutButton variant="outlineInverse" />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
