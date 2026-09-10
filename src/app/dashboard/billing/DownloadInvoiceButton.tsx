"use client";

import { useState } from "react";
import { getInvoicePdfUrl } from "@/lib/paddle/actions";
import { Button } from "@/components/Button";

// Paddle invoice PDF links are short-lived, so this fetches a fresh one on
// click rather than baking a URL into the page at render time.
export function DownloadInvoiceButton({ transactionId }: { transactionId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleClick() {
    setFailed(false);
    setIsLoading(true);
    const result = await getInvoicePdfUrl(transactionId);
    setIsLoading(false);

    if ("url" in result) {
      window.open(result.url, "_blank");
    } else {
      setFailed(true);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        onClick={handleClick}
        disabled={isLoading}
        className="!px-1 !py-0.5 text-[11.5px]"
      >
        {isLoading ? "Opening…" : "Download"}
      </Button>
      {failed && <span className="text-[11px] text-bad-900">Could not open invoice</span>}
    </span>
  );
}
