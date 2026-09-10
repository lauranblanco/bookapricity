"use client";

import { useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { createCheckoutTransaction } from "@/lib/paddle/actions";
import { getPaddleClientEnvironment } from "@/lib/paddle/env";
import type { Tier } from "@/lib/paddle/tiers";
import { Button } from "@/components/Button";
import { ErrorBlock } from "@/components/ErrorBlock";

// The sell card for clubs with no active plan (badge 4c). Checkout itself is
// untouched — createCheckoutTransaction() + Paddle.Checkout.open({
// transactionId }) — this only dresses the button's existing !paddle /
// isSubmitting / error states. No price is shown here by design; if one
// is ever added it belongs in the top bar, not the body.
export function BillingSalesCard({ tier }: { tier: Tier }) {
  const [paddle, setPaddle] = useState<Paddle>();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    initializePaddle({
      environment: getPaddleClientEnvironment(),
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    }).then((instance) => {
      if (!cancelled && instance) setPaddle(instance);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubscribe() {
    if (!paddle) return;
    setError(null);
    setIsSubmitting(true);

    const result = await createCheckoutTransaction(tier.priceId.month);

    setIsSubmitting(false);

    if (result.error || !result.transactionId) {
      setError("Could not start checkout. Try again in a moment.");
      return;
    }

    paddle.Checkout.open({
      transactionId: result.transactionId,
      settings: {
        displayMode: "overlay",
        variant: "one-page",
        successUrl: `${window.location.origin}/welcome`,
      },
    });
  }

  return (
    <div className="border border-umbral bg-white">
      <div className="flex items-center justify-between bg-umbral px-4 py-3">
        <span className="font-heading text-lg font-medium text-crema">Club plan</span>
        <span className="font-mono text-xs font-medium uppercase tracking-[.09em] text-sol">
          Billed monthly
        </span>
      </div>

      <div className="p-5">
        <p className="text-sm text-tinta-800">
          Subscribe to unlock full access to BookApricity for your club. Nothing is lost if you
          cancel — your resources, bookings and members all stay exactly as they are.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
          {tier.features.map((feature, i) => (
            <div key={feature} className="flex items-baseline gap-2.5">
              <span className="font-mono text-xs font-medium text-resol">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[13px] text-tinta-800">{feature}</span>
            </div>
          ))}
        </div>

        {error && <ErrorBlock className="mt-4">{error}</ErrorBlock>}

        <Button
          type="button"
          variant="primary"
          size="lg"
          className="mt-4 !py-[13px] font-heading text-[15px] font-semibold"
          onClick={handleSubscribe}
          disabled={!paddle || isSubmitting}
        >
          {isSubmitting ? "Starting checkout…" : "Subscribe"}
        </Button>
        <p className="mt-2 text-[11.5px] text-tinta-600">
          Secure payment via Paddle. Opens in a window over this page.
        </p>
      </div>
    </div>
  );
}
