"use client";

import { useState } from "react";
import { createPortalSessionUrl } from "@/lib/paddle/actions";
import { Button } from "@/components/Button";
import { ErrorBlock } from "@/components/ErrorBlock";

// The past_due warning banner (README 13) — the nav badge already flips to
// "Past due" everywhere on its own (see dashboard/layout.tsx); this is the
// Billing-page-specific explanation plus the one resol CTA on this whole
// screen, same reasoning as the umbral Join screen: it needs to stand out
// against a page that's otherwise all umbral/tinta.
export function PastDueBanner({ failedAt }: { failedAt: string | null }) {
  const [error, setError] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  async function handleClick() {
    setError(null);
    setIsOpening(true);

    const result = await createPortalSessionUrl("update_payment");

    setIsOpening(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    window.open(result.url, "_blank");
  }

  return (
    <div className="flex flex-col gap-3 border border-sol bg-warn-100 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-heading text-[15px] font-semibold text-warn-900">
          {failedAt ? `Payment failed on ${failedAt}` : "Payment failed"}
        </p>
        <p className="mt-1 text-[13px] text-warn-900">
          Members can still book. Update your payment method to keep the club active.
        </p>
        {error && <ErrorBlock className="mt-2.5 max-w-[320px]">{error}</ErrorBlock>}
      </div>
      <Button
        type="button"
        variant="cta"
        onClick={handleClick}
        disabled={isOpening}
        className="shrink-0"
      >
        {isOpening ? "Opening…" : "Update payment"}
      </Button>
    </div>
  );
}
