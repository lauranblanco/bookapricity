export interface Tier {
  name: string;
  description: string;
  features: string[];
  priceId: { month: string; year?: string };
}

// BookApricity is single-plan today (see CLAUDE.md: "Only the Admin pays:
// one monthly subscription"). Shaped as an array of Tier so adding a second
// or third plan later is just adding an entry here — the pricing card and
// checkout code below already loop over this list.
export const TIERS: Tier[] = [
  {
    name: "Club",
    description: "Everything a club needs to manage bookings and members.",
    features: [
      "Unlimited bookable resources",
      "Unlimited members",
      "One invite link, self-serve booking",
      "Cancel anytime, nothing is lost",
    ],
    priceId: { month: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID! },
  },
];
