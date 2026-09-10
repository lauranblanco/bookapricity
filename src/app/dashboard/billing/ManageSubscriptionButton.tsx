"use client";

import { useState } from "react";
import { createPortalSessionUrl } from "@/lib/paddle/actions";
import { Button } from "@/components/Button";
import { ErrorBlock } from "@/components/ErrorBlock";

// Badge 4d's right-hand side on the active status card: the renewal date
// plus a button into the Paddle-hosted customer portal (opened in a new tab
// — unlike checkout, the portal isn't an overlay flow).
export function ManageSubscriptionButton({ renewsAt }: { renewsAt: string | null }) {
  const [error, setError] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  async function handleClick() {
    setError(null);
    setIsOpening(true);

    const result = await createPortalSessionUrl("overview");

    setIsOpening(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    window.open(result.url, "_blank");
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-3">
        {renewsAt && (
          <span className="font-mono text-xs font-medium uppercase tracking-[.09em] text-ok-900">
            Renews {renewsAt}
          </span>
        )}
        <Button type="button" variant="secondary" onClick={handleClick} disabled={isOpening}>
          {isOpening ? "Opening…" : "Manage subscription"}
        </Button>
      </div>
      {error && <ErrorBlock className="max-w-[280px]">{error}</ErrorBlock>}
    </div>
  );
}
