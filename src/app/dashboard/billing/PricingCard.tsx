"use client";

import { useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { createCheckoutTransaction } from "@/lib/paddle/actions";
import { getPaddleClientEnvironment } from "@/lib/paddle/env";
import type { Tier } from "@/lib/paddle/tiers";
import { Button } from "@/components/Button";
import { ErrorBlock } from "@/components/ErrorBlock";

// Renders one tier's price (via Paddle.PricePreview, localized server-side
// by countryCode when we have it — Paddle.js falls back to IP geolocation
// otherwise) and its Subscribe button (via Paddle.Checkout.open on an
// existing transaction). Only ever displays formattedTotals as Paddle
// returns them — no currency math or re-formatting happens here.
export function PricingCard({
  tier,
  countryCode,
  current = false,
}: {
  tier: Tier;
  countryCode?: string;
  current?: boolean;
}) {
  const [paddle, setPaddle] = useState<Paddle>();
  const [price, setPrice] = useState<string | null>(null);
  const [priceError, setPriceError] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    initializePaddle({
      environment: getPaddleClientEnvironment(),
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    }).then((instance) => {
      if (cancelled || !instance) return;
      setPaddle(instance);

      instance
        .PricePreview({
          items: [{ priceId: tier.priceId.month, quantity: 1 }],
          ...(countryCode ? { address: { countryCode } } : {}),
        })
        .then((result) => {
          if (cancelled) return;
          const lineItem = result.data.details.lineItems[0];
          if (lineItem) {
            setPrice(lineItem.formattedTotals.total);
          } else {
            setPriceError(true);
          }
        })
        .catch(() => {
          if (!cancelled) setPriceError(true);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [tier.priceId.month, countryCode]);

  async function handleSubscribe() {
    if (!paddle) return;
    setCheckoutError(null);
    setIsSubmitting(true);

    const result = await createCheckoutTransaction(tier.priceId.month);

    setIsSubmitting(false);

    if (result.error || !result.transactionId) {
      setCheckoutError(result.error ?? "Could not start checkout");
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
    <div className="max-w-sm border border-[rgba(42,33,24,0.2)] bg-white p-5">
      <div className="font-heading text-lg font-semibold text-tinta">{tier.name}</div>
      <p className="mt-1 text-[13px] text-tinta-800">{tier.description}</p>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="font-heading text-3xl font-medium text-tinta">
          {priceError ? "—" : (price ?? "…")}
        </span>
        <span className="text-sm text-tinta-600">/ month</span>
      </div>
      {priceError && (
        <p className="mt-1 text-xs text-tinta-600">Couldn&apos;t load live pricing.</p>
      )}

      <ul className="mt-4 flex flex-col gap-1.5 text-[13px] text-tinta-800">
        {tier.features.map((feature) => (
          <li key={feature}>· {feature}</li>
        ))}
      </ul>

      {checkoutError && <ErrorBlock className="mt-3">{checkoutError}</ErrorBlock>}

      {current ? (
        <p className="mt-4 text-center text-[13px] font-medium text-tinta-600">Current plan</p>
      ) : (
        <Button
          type="button"
          variant="primary"
          block
          className="mt-4"
          onClick={handleSubscribe}
          disabled={!paddle || isSubmitting}
        >
          {isSubmitting ? "Starting checkout…" : "Subscribe"}
        </Button>
      )}
    </div>
  );
}
