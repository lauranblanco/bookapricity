import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { generateSlotsForDate, type AvailableHours } from "@/lib/booking/slots";
import { formatTime, groupSlotsByTimeOfDay } from "@/lib/booking/present";
import { BookingBoard, type SlotView } from "@/components/BookingBoard";
import { Select } from "@/components/Select";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { FieldLabel } from "@/components/Label";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { SlotState } from "@/components/BookSlotButton";

const WEEKDAY_ABBR = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function mondayOfWeek(date: Date) {
  const daysFromMonday = (date.getDay() + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - daysFromMonday);
  return monday;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function BookPage({
  searchParams,
}: {
  searchParams: { resourceId?: string; date?: string };
}) {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: resources } = await supabase
    .from("resources")
    .select(
      "id, name, capacity, booking_duration_minutes, cancellation_cutoff_minutes, available_hours",
    )
    .eq("club_id", profile!.club_id!)
    .order("name");

  const dateString = searchParams.date ?? todayDateString();
  const selectedResource =
    resources?.find((r) => r.id === searchParams.resourceId) ?? resources?.[0];

  const selectedDate = new Date(`${dateString}T00:00:00`);
  const monday = mondayOfWeek(selectedDate);
  const dayTabs = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return {
      iso: isoDate(day),
      abbr: WEEKDAY_ABBR[i],
      num: day.getDate(),
      isActive: isoDate(day) === dateString,
    };
  });

  let groups: ReturnType<typeof groupSlotsByTimeOfDay> = [];

  if (selectedResource) {
    const slots = generateSlotsForDate(
      selectedResource.available_hours as AvailableHours,
      selectedResource.booking_duration_minutes,
      selectedDate,
    );

    const dayStart = new Date(`${dateString}T00:00:00`);
    const dayEnd = new Date(`${dateString}T23:59:59.999`);

    const { data: existingReservations } = await supabase
      .from("reservations")
      .select("start_time, member_id")
      .eq("resource_id", selectedResource.id)
      .eq("status", "confirmed")
      .gte("start_time", dayStart.toISOString())
      .lte("start_time", dayEnd.toISOString());

    const countByStart = new Map<string, number>();
    const mineStarts = new Set<string>();
    for (const reservation of existingReservations ?? []) {
      const key = new Date(reservation.start_time).toISOString();
      countByStart.set(key, (countByStart.get(key) ?? 0) + 1);
      if (reservation.member_id === profile!.id) {
        mineStarts.add(key);
      }
    }

    const now = Date.now();
    const slotViews = slots.map((slot) => {
      const key = slot.start.toISOString();
      const remaining = Math.max(selectedResource.capacity - (countByStart.get(key) ?? 0), 0);
      const isMine = mineStarts.has(key);
      const isPast = slot.start.getTime() < now;

      let state: SlotState;
      if (isMine) state = "selected";
      else if (isPast) state = "past";
      else if (remaining <= 0) state = "full";
      else if (remaining === 1) state = "last";
      else state = "available";

      const view: SlotView & { start: Date } = {
        start: slot.start,
        startIso: slot.start.toISOString(),
        endIso: slot.end.toISOString(),
        timeLabel: formatTime(slot.start),
        remaining,
        state,
      };
      return view;
    });

    groups = groupSlotsByTimeOfDay(slotViews);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between border-b-2 border-[rgba(42,33,24,0.4)] pb-3">
        <h2 className="font-heading text-[30px] font-medium tracking-[-.012em] text-tinta">
          Book a slot
        </h2>
        {selectedResource && (
          <span className="font-mono text-[11px] font-medium uppercase tracking-[.09em] text-tinta-600">
            {selectedResource.name} · {selectedResource.booking_duration_minutes} min · capacity{" "}
            {selectedResource.capacity}
          </span>
        )}
      </div>

      <form className="flex flex-wrap items-end gap-2.5">
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Resource</FieldLabel>
          <Select name="resourceId" defaultValue={selectedResource?.id ?? ""} className="w-[210px]">
            {resources?.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="flex flex-col gap-1.5">
          <FieldLabel>Date</FieldLabel>
          <Input type="date" name="date" defaultValue={dateString} className="w-[160px]" />
        </label>

        <Button type="submit" variant="primary">
          Show slots
        </Button>
      </form>

      <div className="grid grid-cols-7 gap-1.5 border-b border-[rgba(42,33,24,0.18)] pb-0 md:flex md:gap-1.5">
        {dayTabs.map((day) => (
          <Link
            key={day.iso}
            href={`/book?resourceId=${selectedResource?.id ?? ""}&date=${day.iso}`}
            className={cn(
              "flex min-h-11 min-w-16 flex-col items-center justify-center gap-0.5 border border-transparent px-1 py-2 text-center md:items-start md:justify-start md:px-3.5 md:pb-2 md:pt-2.5 md:text-left",
              day.isActive
                ? "bg-umbral text-crema md:bg-white md:text-tinta md:shadow-[inset_0_-3px_0_#E2683F]"
                : "text-tinta-600",
            )}
          >
            <span className="font-mono text-[10px] font-medium uppercase tracking-[.1em]">
              {day.abbr}
            </span>
            <span
              className={cn(
                "font-heading text-[17px] tracking-[-.01em]",
                day.isActive ? "font-semibold" : "font-normal",
              )}
            >
              {day.num}
            </span>
          </Link>
        ))}
      </div>

      {!selectedResource && (
        <p className="text-sm text-tinta-600">No resources available yet.</p>
      )}

      {selectedResource && groups.length === 0 && (
        <p className="text-sm text-tinta-600">
          {selectedResource.name} has no available hours on this day.
        </p>
      )}

      {selectedResource && groups.length > 0 && (
        <BookingBoard
          key={`${selectedResource.id}-${dateString}`}
          resourceId={selectedResource.id}
          resourceName={selectedResource.name}
          cutoffMinutes={selectedResource.cancellation_cutoff_minutes}
          groups={groups}
        />
      )}
    </div>
  );
}
