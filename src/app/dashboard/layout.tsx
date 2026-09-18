import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";
import { BrandMark } from "@/components/BrandMark";
import { AdminNavTabs, type NavTabItem } from "@/components/NavTabs";
import { MobileNavMenu } from "@/components/MobileNavMenu";
import { Badge, type BadgeTone } from "@/components/Badge";
import { redirect } from "next/navigation";
import { PLAN_NAMES, effectivePlan, type PlanId } from "@/lib/plans/limits";

const NAV_ITEMS: NavTabItem[] = [
  { href: "/dashboard", label: "Reservations" },
  { href: "/dashboard/resources", label: "Resources" },
  { href: "/dashboard/members", label: "Members" },
  { href: "/dashboard/billing", label: "Billing" },
];

const STATUS_TONE: Record<string, BadgeTone> = {
  active: "planActive",
  past_due: "pastDue",
  inactive: "inactive",
  cancelled: "cancelledPlan",
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
    .select("subscription_status, plan")
    .eq("id", profile.club_id)
    .single();

  const status = club?.subscription_status ?? "inactive";
  const plan = effectivePlan((club?.plan as PlanId) ?? "free", status);
  const badgeLabel =
    status === "past_due"
      ? "Past due"
      : status === "cancelled"
        ? "Cancelled plan"
        : `${PLAN_NAMES[plan]} plan`;
  const badgeTone = STATUS_TONE[status] ?? "inactive";

  return (
    <div className="min-h-screen bg-crema">
      <header className="relative bg-umbral">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:mx-auto md:h-[58px] md:max-w-6xl md:px-6 md:py-0">
          <div className="flex min-w-0 items-center gap-3 md:gap-6">
            <MobileNavMenu items={NAV_ITEMS} theme="dark" />
            <div className="flex min-w-0 items-center gap-2">
              <BrandMark variant="negative" size={24} />
              <span className="truncate font-heading text-sm font-semibold tracking-[-.01em] text-crema">
                BookApricity
              </span>
            </div>
            <div className="hidden md:block">
              <AdminNavTabs items={NAV_ITEMS} />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3.5">
            <Badge tone={badgeTone}>{badgeLabel}</Badge>
            <span className="hidden truncate text-xs text-[rgba(251,243,228,0.7)] sm:inline">
              {profile.email}
            </span>
            <SignOutButton variant="outlineInverse" />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
