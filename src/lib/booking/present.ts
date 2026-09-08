import type { SlotState } from "@/components/BookSlotButton";
import type { SlotGroup, SlotView } from "@/components/BookingBoard";

// Pure presentation helpers shared by the booking screens: date/time
// formatting, the "Book a slot" time-of-day grouping, and cancellation-cutoff
// wording. Derived from already-loaded data — no booking rules or queries
// live here (those stay in booking/slots.ts and reservations/actions.ts).

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatTime(date: Date) {
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function formatDateLabel(date: Date) {
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function sameCalendarDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function cutoffDayWord(cutoff: Date, now: Date) {
  if (sameCalendarDay(cutoff, now)) return "today";
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (sameCalendarDay(cutoff, tomorrow)) return "tomorrow";
  return formatDateLabel(cutoff);
}

export function cancellationStatus(
  startIso: string,
  cutoffMinutes: number,
  now: Date = new Date(),
): { canCancel: boolean; text: string } {
  const cutoff = new Date(new Date(startIso).getTime() - cutoffMinutes * 60_000);

  if (now.getTime() >= cutoff.getTime()) {
    return { canCancel: false, text: "Cancellation window has passed." };
  }

  const time = formatTime(cutoff);
  const text = sameCalendarDay(cutoff, now)
    ? `Free cancellation until ${time}`
    : `Free cancellation until ${time} on ${formatDateLabel(cutoff)}`;
  return { canCancel: true, text };
}

type TimeOfDay = "morning" | "afternoon" | "evening";

function timeOfDay(hour: number): TimeOfDay {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

const GROUP_LABELS: Record<TimeOfDay, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

function counterText(slots: SlotView[]) {
  const open = slots.filter((s) => s.state === "available" || s.state === "last").length;
  const full = slots.filter((s) => s.state === "full").length;
  const past = slots.filter((s) => s.state === "past").length;
  const mine = slots.filter((s) => s.state === "selected").length;

  const parts: string[] = [];
  if (open) parts.push(`${open} open`);
  if (full) parts.push(`${full} full`);
  if (past) parts.push(`${past} past`);
  if (mine) parts.push(`${mine} yours`);
  return parts.join(" · ");
}

export function groupSlotsByTimeOfDay(
  slots: { start: Date; startIso: string; endIso: string; timeLabel: string; remaining: number; state: SlotState }[],
): SlotGroup[] {
  const buckets: Record<TimeOfDay, SlotView[]> = { morning: [], afternoon: [], evening: [] };

  for (const slot of slots) {
    buckets[timeOfDay(slot.start.getHours())].push({
      startIso: slot.startIso,
      endIso: slot.endIso,
      timeLabel: slot.timeLabel,
      remaining: slot.remaining,
      state: slot.state,
    });
  }

  return (["morning", "afternoon", "evening"] as const)
    .filter((key) => buckets[key].length > 0)
    .map((key) => ({
      key,
      label: GROUP_LABELS[key],
      slots: buckets[key],
      counterText: counterText(buckets[key]),
    }));
}
