"use client";

import { createReservation } from "@/lib/reservations/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";

export type SlotState = "available" | "last" | "full" | "past" | "selected";

const STATE_CLASSES: Record<SlotState, string> = {
  available: "border-umbral bg-white hover:border-resol hover:bg-umbral-100",
  last: "border-sol bg-white hover:bg-[#FCEFD5]",
  full: "border-[rgba(42,33,24,0.14)] bg-crema-200 cursor-not-allowed",
  past: "border-[rgba(42,33,24,0.14)] bg-crema-200 opacity-[.55] cursor-not-allowed",
  selected: "border-umbral bg-umbral cursor-default",
};

const STATUS_TEXT: Record<SlotState, string> = {
  available: "left",
  last: "left",
  full: "Full",
  past: "Past",
  selected: "Selected",
};

const STATUS_CLASSES: Record<SlotState, string> = {
  available: "text-ok",
  last: "text-warn-900",
  full: "text-tinta-800",
  past: "text-tinta-800",
  selected: "text-sol",
};

const TIME_CLASSES: Record<SlotState, string> = {
  available: "text-tinta",
  last: "text-tinta",
  full: "text-tinta-600",
  past: "text-tinta-600 line-through",
  selected: "text-white",
};

export function BookSlotButton({
  resourceId,
  startIso,
  endIso,
  timeLabel,
  remaining,
  state,
  onBooked,
  onError,
}: {
  resourceId: string;
  startIso: string;
  endIso: string;
  timeLabel: string;
  remaining: number;
  state: SlotState;
  onBooked?: (booking: { id: string; startIso: string; endIso: string }) => void;
  onError?: (message: string) => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const disabled = state === "past" || state === "full" || state === "selected" || isSubmitting;

  async function handleClick() {
    if (disabled) return;
    setIsSubmitting(true);

    const result = await createReservation(resourceId, startIso);

    setIsSubmitting(false);

    if (result?.error) {
      onError?.(result.error);
      return;
    }

    if (result?.id) {
      onBooked?.({ id: result.id, startIso, endIso });
    }
    router.refresh();
  }

  const statusLabel =
    state === "available" || state === "last" ? `${remaining} left` : STATUS_TEXT[state];

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={state === "selected"}
      className={cn(
        "flex min-h-11 flex-col items-start gap-0.5 border px-3 py-[11px] text-left transition-colors duration-[120ms] ease-out disabled:pointer-events-none",
        STATE_CLASSES[state],
        isSubmitting && "opacity-[.45]",
      )}
    >
      <span
        className={cn(
          "font-mono text-[18px] font-medium tracking-[-.01em] md:text-[17px]",
          TIME_CLASSES[state],
        )}
      >
        {timeLabel}
      </span>
      <span
        className={cn(
          "font-mono text-[10.5px] font-medium uppercase tracking-[.08em]",
          STATUS_CLASSES[state],
        )}
      >
        {statusLabel}
      </span>
    </button>
  );
}
