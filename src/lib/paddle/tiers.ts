import type { PlanId } from "@/lib/plans/limits";

export interface Tier {
  id: Exclude<PlanId, "free">;
  name: string;
  description: string;
  features: string[];
  priceId: { month: string; year?: string };
}

// The two paid plans (see src/lib/plans/limits.ts for the free tier and
// the numeric limits behind "up to N resources/members" below). Shaped as
// an array of Tier so the pricing card and checkout code loop over this
// list rather than special-casing each plan.
export const TIERS: Tier[] = [
  {
    id: "small",
    name: "Club",
    description: "For small and medium clubs and associations.",
    features: [
      "Up to 10 bookable resources",
      "Up to 30 members",
      "One invite link, self-serve booking",
      "Cancel anytime, nothing is lost",
    ],
    priceId: { month: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_SMALL! },
  },
  {
    id: "unlimited",
    name: "Big Club",
    description: "For larger clubs and associations with no limits.",
    features: [
      "Unlimited bookable resources",
      "Unlimited members",
      "One invite link, self-serve booking",
      "Cancel anytime, nothing is lost",
    ],
    priceId: { month: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_UNLIMITED! },
  },
];
