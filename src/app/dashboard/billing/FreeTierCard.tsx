import { PLAN_LIMITS } from "@/lib/plans/limits";

// The free plan has no Paddle price, so this is a static card next to the
// PricingCard ones for the two paid tiers -- same layout, no live price
// fetch or Subscribe button.
export function FreeTierCard({ current }: { current: boolean }) {
  const limits = PLAN_LIMITS.free;

  return (
    <div className="max-w-sm border border-[rgba(42,33,24,0.2)] bg-white p-5">
      <div className="font-heading text-lg font-semibold text-tinta">Free</div>
      <p className="mt-1 text-[13px] text-tinta-800">
        For clubs just getting started.
      </p>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="font-heading text-3xl font-medium text-tinta">$0</span>
        <span className="text-sm text-tinta-600">/ month</span>
      </div>

      <ul className="mt-4 flex flex-col gap-1.5 text-[13px] text-tinta-800">
        <li>· Up to {limits.resources} bookable resource</li>
        <li>· Up to {limits.members} members</li>
        <li>· One invite link, self-serve booking</li>
      </ul>

      {current && (
        <p className="mt-4 text-center text-[13px] font-medium text-tinta-600">Current plan</p>
      )}
    </div>
  );
}
