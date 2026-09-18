export type PlanId = "free" | "small" | "unlimited";

export type PlanLimits = { resources: number | null; members: number | null };

// Mirrors club_can_add_resource / club_can_add_member in
// supabase/migrations/20260916000000_subscription_plan_limits.sql -- those
// functions are the actual enforcement; this is for UI display only, so
// keep the two in sync by hand. `null` means no limit.
export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: { resources: 1, members: 5 },
  small: { resources: 10, members: 30 },
  unlimited: { resources: null, members: null },
};

export const PLAN_NAMES: Record<PlanId, string> = {
  free: "Free",
  small: "Club",
  unlimited: "Big Club",
};

// A club's plan column only reflects what it last purchased -- while its
// subscription isn't active/past_due, its actual limits are the free
// tier's. Mirrors club_effective_plan() in the migration above.
export function effectivePlan(
  plan: PlanId,
  subscriptionStatus: "inactive" | "active" | "past_due" | "cancelled",
): PlanId {
  return subscriptionStatus === "active" || subscriptionStatus === "past_due" ? plan : "free";
}
