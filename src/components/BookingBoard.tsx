"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cancelReservation } from "@/lib/reservations/actions";
import { BookSlotButton, type SlotState } from "@/components/BookSlotButton";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { ErrorBlock } from "@/components/ErrorBlock";
import { cn } from "@/lib/cn";
import { cutoffDayWord, formatDateLabel, formatTime } from "@/lib/booking/present";

export type SlotView = {
  startIso: string;
  endIso: string;
  timeLabel: string;
  remaining: number;
  state: SlotState;
};

export type SlotGroup = {
  key: string;
  label: string;
  slots: SlotView[];
  counterText: string;
};

type LastBooking = {
  id: string;
  dateLabel: string;
  fromLabel: string;
  toLabel: string;
  cutoffText: string;
};

const AUTO_CLEAR_MS = 60_000;

export function BookingBoard({
  resourceId,
  resourceName,
  cutoffMinutes,
  groups,
}: {
  resourceId: string;
  resourceName: string;
  cutoffMinutes: number;
  groups: SlotGroup[];
}) {
  const router = useRouter();
  const [lastBooking, setLastBooking] = useState<LastBooking | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [undoError, setUndoError] = useState<string | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);

  useEffect(() => {
    if (!lastBooking) return;
    const timer = setTimeout(() => setLastBooking(null), AUTO_CLEAR_MS);
    return () => clearTimeout(timer);
  }, [lastBooking]);

  function handleBooked({ id, startIso, endIso }: { id: string; startIso: string; endIso: string }) {
    setBookingError(null);
    setUndoError(null);
    const start = new Date(startIso);
    const end = new Date(endIso);
    const cutoff = new Date(start.getTime() - cutoffMinutes * 60_000);
    setLastBooking({
      id,
      dateLabel: formatDateLabel(start),
      fromLabel: formatTime(start),
      toLabel: formatTime(end),
      cutoffText: `Free until ${formatTime(cutoff)} ${cutoffDayWord(cutoff, new Date())} — ${cutoffMinutes} min before the slot starts.`,
    });
  }

  async function handleUndo() {
    if (!lastBooking) return;
    setIsUndoing(true);
    setUndoError(null);

    const result = await cancelReservation(lastBooking.id);

    setIsUndoing(false);

    if (result?.error) {
      setUndoError(result.error);
      return;
    }

    setLastBooking(null);
    router.refresh();
  }

  return (
    <div className={cn("grid gap-6", lastBooking ? "lg:grid-cols-[1fr_268px]" : "lg:grid-cols-1")}>
      <div className="flex flex-col gap-5 pb-20 lg:pb-0">
        {bookingError && <ErrorBlock>{bookingError}</ErrorBlock>}

        {groups.map((group) => (
          <div key={group.key}>
            <div className="mb-2.5 flex items-center gap-2.5">
              <span className="font-mono text-[11px] font-medium uppercase tracking-[.1em] text-tinta">
                {group.label}
              </span>
              <span className="h-px flex-1 bg-[rgba(42,33,24,0.18)]" />
              <span className="text-[11px] text-tinta-600">{group.counterText}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {group.slots.map((slot) => (
                <BookSlotButton
                  key={slot.startIso}
                  resourceId={resourceId}
                  startIso={slot.startIso}
                  endIso={slot.endIso}
                  timeLabel={slot.timeLabel}
                  remaining={slot.remaining}
                  state={slot.state}
                  onBooked={handleBooked}
                  onError={setBookingError}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {lastBooking && (
        <>
          {/* Desktop confirmation panel */}
          <div className="hidden self-start border border-[rgba(42,33,24,0.2)] bg-white lg:block">
            <div className="bg-umbral px-3.5 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[.1em] text-crema">
              Booked just now
            </div>
            <div className="p-3.5">
              <div className="font-heading text-lg font-semibold tracking-[-.01em] text-tinta">
                {resourceName}
              </div>
              <div className="mt-0.5 text-[12.5px] text-tinta-800">
                {lastBooking.dateLabel} · {lastBooking.fromLabel} – {lastBooking.toLabel}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge tone="confirmed">Confirmed</Badge>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleUndo}
                  disabled={isUndoing}
                >
                  {isUndoing ? "Undoing…" : "Undo"}
                </Button>
              </div>
              <hr className="my-3.5 border-[rgba(42,33,24,0.15)]" />
              <div className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[.1em] text-tinta-600">
                Cancellation
              </div>
              <p className="text-xs text-tinta-800">{lastBooking.cutoffText}</p>
              {undoError && <ErrorBlock className="mt-3">{undoError}</ErrorBlock>}
            </div>
          </div>

          {/* Mobile sticky confirmation bar */}
          <div className="fixed inset-x-0 bottom-0 z-10 flex flex-col gap-2 bg-tinta px-4 py-3 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-heading text-[12.5px] font-semibold text-crema">
                  Booked {lastBooking.fromLabel} · {resourceName}
                </div>
                <div className="text-[11px] text-[rgba(251,243,228,0.7)]">
                  Confirmed for {lastBooking.dateLabel}
                </div>
              </div>
              <Button
                type="button"
                variant="outlineInverse"
                size="sm"
                onClick={handleUndo}
                disabled={isUndoing}
              >
                {isUndoing ? "Undoing…" : "Undo"}
              </Button>
            </div>
            {undoError && <ErrorBlock>{undoError}</ErrorBlock>}
          </div>
        </>
      )}
    </div>
  );
}
