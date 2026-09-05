"use client";

import { useState } from "react";

export function CopyInviteLink({ inviteUrl }: { inviteUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-3 rounded border border-gray-200 p-4">
      <code className="flex-1 break-all text-sm">{inviteUrl}</code>
      <button
        onClick={handleCopy}
        className="whitespace-nowrap rounded border border-gray-300 px-3 py-1 text-sm"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
