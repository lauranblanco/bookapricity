"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { regenerateInviteLink } from "@/lib/members/actions";
import { Button } from "@/components/Button";
import { ErrorBlock } from "@/components/ErrorBlock";
import { cn } from "@/lib/cn";

export function CopyInviteLink({ inviteUrl }: { inviteUrl: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  // The QR is cached by data URL — if the link changes underneath us
  // (regenerate), drop the stale image so the next "Show QR" re-encodes it.
  useEffect(() => {
    setQrDataUrl(null);
  }, [inviteUrl]);

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleToggleQr() {
    if (!qrDataUrl) {
      const dataUrl = await QRCode.toDataURL(inviteUrl, { margin: 1, width: 160 });
      setQrDataUrl(dataUrl);
    }
    setShowQr((prev) => !prev);
  }

  async function handleShare() {
    await navigator.share({ url: inviteUrl, title: "Join our club on BookApricity" });
  }

  async function handleRegenerate() {
    if (
      !window.confirm(
        "Regenerate the invite link? The current link will stop working immediately.",
      )
    ) {
      return;
    }

    setRegenerateError(null);
    setIsRegenerating(true);

    const result = await regenerateInviteLink();

    setIsRegenerating(false);

    if (result?.error) {
      setRegenerateError(result.error);
      return;
    }

    setShowQr(false);
    router.refresh();
  }

  return (
    <div>
      <div
        className={cn(
          "border",
          copied ? "border-ok bg-ok-100" : "border-[rgba(42,33,24,0.2)] bg-white",
        )}
      >
        <div className="flex items-stretch">
          <div className="flex-1 p-3.5">
            <div
              className={cn(
                "font-mono text-[10px] font-medium uppercase tracking-[.1em]",
                copied ? "text-ok-900" : "text-tinta-600",
              )}
            >
              {copied ? "Copied to clipboard" : "Invite link"}
            </div>
            <div className="mt-1 break-all font-mono text-sm text-tinta">{inviteUrl}</div>
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={handleCopy}
            className="!self-stretch shrink-0 !rounded-none !px-[22px] !py-0 font-heading !text-[13px] !font-semibold"
          >
            Copy link
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-crema-100 px-4 py-[11px]">
          <p className="text-[12.5px] text-tinta-800">
            Share this link with people you want to invite to the club.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleToggleQr}
              className="!px-1 !py-0.5 text-[11.5px]"
            >
              {showQr ? "Hide QR" : "Show QR"}
            </Button>
            {canShare && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleShare}
                className="!px-1 !py-0.5 text-[11.5px]"
              >
                Share
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="!px-1 !py-0.5 !text-resol-700 text-[11.5px] hover:!bg-resol-100"
            >
              {isRegenerating ? "Regenerating…" : "Regenerate"}
            </Button>
          </div>
        </div>
      </div>

      {regenerateError && <ErrorBlock className="mt-2.5">{regenerateError}</ErrorBlock>}

      {showQr && qrDataUrl && (
        <div className="mt-2.5 inline-block border border-[rgba(42,33,24,0.2)] bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR code for the invite link" width={160} height={160} />
        </div>
      )}
    </div>
  );
}
