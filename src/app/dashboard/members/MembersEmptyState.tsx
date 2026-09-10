"use client";

import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/Button";

export function MembersEmptyState({ inviteUrl }: { inviteUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-start gap-2.5 border border-dashed border-[rgba(42,33,24,0.35)] bg-white p-5">
      <BrandMark size={34} className="opacity-50" />
      <h3 className="font-heading text-base font-semibold text-tinta">
        You&apos;re the only one here
      </h3>
      <p className="text-[12.5px] text-tinta-800">
        Share the link in the club&apos;s group chat and members sign themselves up. You
        don&apos;t need to add them one by one.
      </p>
      <Button type="button" variant="primary" onClick={handleCopy}>
        {copied ? "Copied!" : "Copy invite link"}
      </Button>
    </div>
  );
}
