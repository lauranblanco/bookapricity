export const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

// { mon: [["09:00","12:00"], ["14:00","18:00"]], tue: [], ... }
export type AvailableHours = Partial<Record<DayKey, [string, string][]>>;

export type Slot = { start: Date; end: Date };

function dayKeyForDate(date: Date): DayKey {
  return DAY_KEYS[date.getDay()];
}

function timeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function atMinutesOfDay(date: Date, minutesOfDay: number): Date {
  const result = new Date(date);
  result.setHours(0, Math.round(minutesOfDay), 0, 0);
  return result;
}

// All bookable slots for a resource on a given calendar day, based on its
// weekly available_hours and its fixed booking duration. Only whole slots
// that fit entirely inside an open window are included.
export function generateSlotsForDate(
  availableHours: AvailableHours,
  durationMinutes: number,
  date: Date,
): Slot[] {
  const windows = availableHours[dayKeyForDate(date)] ?? [];
  const slots: Slot[] = [];

  for (const [windowStart, windowEnd] of windows) {
    const windowStartMinutes = timeStringToMinutes(windowStart);
    const windowEndMinutes = timeStringToMinutes(windowEnd);

    for (
      let slotStart = windowStartMinutes;
      slotStart + durationMinutes <= windowEndMinutes;
      slotStart += durationMinutes
    ) {
      slots.push({
        start: atMinutesOfDay(date, slotStart),
        end: atMinutesOfDay(date, slotStart + durationMinutes),
      });
    }
  }

  return slots;
}

// Server-side guard: is [start, end) actually inside one of the resource's
// open windows for that day? Re-checked at booking time so a client can't
// submit an out-of-hours slot.
export function isWithinAvailableHours(
  availableHours: AvailableHours,
  start: Date,
  end: Date,
): boolean {
  if (start.toDateString() !== end.toDateString()) return false;

  const windows = availableHours[dayKeyForDate(start)] ?? [];
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();

  return windows.some(([windowStart, windowEnd]) => {
    return (
      startMinutes >= timeStringToMinutes(windowStart) &&
      endMinutes <= timeStringToMinutes(windowEnd)
    );
  });
}
