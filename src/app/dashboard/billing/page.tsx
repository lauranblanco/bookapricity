import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { getPaddleClient } from "@/lib/paddle/server";
import { BillingStatusCard, type PlanStatus } from "./BillingStatusCard";
import { FreeTierCard } from "./FreeTierCard";
import { PricingCard } from "./PricingCard";
import { ManageSubscriptionButton } from "./ManageSubscriptionButton";
import { InvoicesTable, type InvoiceRow } from "./InvoicesTable";
import { PastDueBanner } from "./PastDueBanner";
import { TIERS } from "@/lib/paddle/tiers";
import { Badge } from "@/components/Badge";
import { formatDayMonthYearShort } from "@/lib/booking/present";
import { PLAN_LIMITS, PLAN_NAMES, effectivePlan, type PlanId } from "@/lib/plans/limits";

const STATUS_BADGE: Record<Exclude<PlanStatus, "active">, { label: string; tone: "inactive" | "pastDue" | "cancelledPlan" }> = {
  inactive: { label: "Inactive", tone: "inactive" },
  past_due: { label: "Past due", tone: "pastDue" },
  cancelled: { label: "Cancelled plan", tone: "cancelledPlan" },
};

async function getRenewsAt(subscriptionId: string) {
  try {
    const paddle = getPaddleClient();
    const subscription = await paddle.subscriptions.get(subscriptionId);
    return subscription.nextBilledAt
      ? formatDayMonthYearShort(new Date(subscription.nextBilledAt))
      : null;
  } catch {
    return null;
  }
}

async function getPaidInvoices(subscriptionId: string): Promise<InvoiceRow[]> {
  try {
    const paddle = getPaddleClient();
    const page = await paddle.transactions
      .list({ subscriptionId: [subscriptionId], status: ["paid", "completed"], perPage: 10 })
      .next();
    return page
      .filter((t) => t.billedAt)
      .map((t) => ({ transactionId: t.id, billedAt: t.billedAt as string }));
  } catch {
    return [];
  }
}

async function getLastFailedAt(subscriptionId: string) {
  try {
    const paddle = getPaddleClient();
    const page = await paddle.transactions
      .list({ subscriptionId: [subscriptionId], status: ["past_due"], perPage: 1 })
      .next();
    const failedAt = page[0]?.billedAt ?? page[0]?.createdAt;
    return failedAt ? formatDayMonthYearShort(new Date(failedAt)) : null;
  } catch {
    return null;
  }
}

export default async function BillingPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: club } = await supabase
    .from("clubs")
    .select("name, subscription_status, paddle_subscription_id, plan")
    .eq("id", profile!.club_id!)
    .single();

  const status = (club?.subscription_status as PlanStatus) ?? "inactive";
  const isActive = status === "active";
  const subscriptionId = club?.paddle_subscription_id;
  const plan = effectivePlan((club?.plan as PlanId) ?? "free", status);
  const limits = PLAN_LIMITS[plan];

  const [{ count: resourceCount }, { count: memberCount }] = await Promise.all([
    supabase
      .from("resources")
      .select("id", { count: "exact", head: true })
      .eq("club_id", profile!.club_id!),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("club_id", profile!.club_id!),
  ]);

  const [renewsAt, invoices] =
    isActive && subscriptionId
      ? await Promise.all([getRenewsAt(subscriptionId), getPaidInvoices(subscriptionId)])
      : [null, []];

  const failedAt =
    status === "past_due" && subscriptionId ? await getLastFailedAt(subscriptionId) : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between border-b-2 border-[rgba(42,33,24,0.4)] pb-3">
        <h2 className="font-heading text-[30px] font-medium tracking-[-.012em] text-tinta">
          Billing
        </h2>
        <span className="font-mono text-[11px] font-medium uppercase tracking-[.09em] text-tinta-600">
          {club?.name}
        </span>
      </div>

      <BillingStatusCard status={status}>
        {isActive && <ManageSubscriptionButton renewsAt={renewsAt} />}
        {!isActive && (
          <Badge tone={STATUS_BADGE[status].tone}>{STATUS_BADGE[status].label}</Badge>
        )}
      </BillingStatusCard>

      <div className="flex items-center justify-between border border-[rgba(42,33,24,0.2)] bg-white p-4">
        <div>
          <div className="font-mono text-[10px] font-medium uppercase tracking-[.1em] text-tinta-600">
            {PLAN_NAMES[plan]} plan usage
          </div>
          <div className="mt-1 text-[13px] text-tinta-800">
            {resourceCount ?? 0} of {limits.resources ?? "unlimited"} resources ·{" "}
            {memberCount ?? 0} of {limits.members ?? "unlimited"} members
          </div>
        </div>
      </div>

      {status === "past_due" && <PastDueBanner failedAt={failedAt} />}

      {isActive && <InvoicesTable invoices={invoices} />}

      {(status === "inactive" || status === "cancelled") && (
        <div className="grid gap-4 sm:grid-cols-3">
          <FreeTierCard current={plan === "free"} />
          {TIERS.map((tier) => (
            <PricingCard key={tier.id} tier={tier} current={plan === tier.id} />
          ))}
        </div>
      )}
    </div>
  );
}
