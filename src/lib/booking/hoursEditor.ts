import { type DayKey } from "@/lib/booking/slots";

// Pure presentation helpers for the resource hours editor: day ordering,
// hour<->minutes conversions, live-computed footer counts, and the mobile
// preset shapes. The data shape itself (Record<DayKey, DaySchedule>) is
// exactly what ResourceForm already reads/writes — nothing here changes it.

export type DaySchedule = { enabled: boolean; start: string; end: string };
export type WeekSchedule = Record<DayKey, DaySchedule>;

export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

// The desktop week table and day-strip elsewhere read Monday-first.
export const MONDAY_FIRST: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
// The mobile day-square row in the design (1g) is Sunday-first.
export const SUNDAY_FIRST: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function weeklyOpenMinutes(week: WeekSchedule): number {
  return MONDAY_FIRST.reduce((sum, day) => {
    const d = week[day];
    if (!d.enabled) return sum;
    return sum + Math.max(timeToMinutes(d.end) - timeToMinutes(d.start), 0);
  }, 0);
}

export function weeklySlotCount(week: WeekSchedule, durationMinutes: number): number {
  if (durationMinutes <= 0) return 0;
  return MONDAY_FIRST.reduce((sum, day) => {
    const d = week[day];
    if (!d.enabled) return sum;
    const windowMinutes = Math.max(timeToMinutes(d.end) - timeToMinutes(d.start), 0);
    return sum + Math.floor(windowMinutes / durationMinutes);
  }, 0);
}

export function formatHours(minutes: number): string {
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours}` : hours.toFixed(1);
}

export function closedDaysLabel(week: WeekSchedule): string {
  const closed = MONDAY_FIRST.filter((day) => !week[day].enabled);
  if (closed.length === 0) return "";
  return `${closed.map((day) => DAY_LABELS[day].toUpperCase()).join(", ")} CLOSED`;
}

export type PresetKey = "weekdays" | "everyday" | "weekends";

export const PRESET_LABELS: Record<PresetKey, string> = {
  weekdays: "Weekdays 9–17",
  everyday: "Every day 8–22",
  weekends: "Weekends only",
};

const WEEKEND: DayKey[] = ["sat", "sun"];

export function applyPreset(preset: PresetKey, current: WeekSchedule): WeekSchedule {
  const next: WeekSchedule = { ...current };

  if (preset === "weekdays") {
    for (const day of MONDAY_FIRST) {
      next[day] = WEEKEND.includes(day)
        ? { ...current[day], enabled: false }
        : { enabled: true, start: "09:00", end: "17:00" };
    }
  } else if (preset === "everyday") {
    for (const day of MONDAY_FIRST) {
      next[day] = { enabled: true, start: "08:00", end: "22:00" };
    }
  } else if (preset === "weekends") {
    for (const day of MONDAY_FIRST) {
      next[day] = WEEKEND.includes(day)
        ? {
            enabled: true,
            start: current[day].enabled ? current[day].start : "09:00",
            end: current[day].enabled ? current[day].end : "17:00",
          }
        : { ...current[day], enabled: false };
    }
  }

  return next;
}

export function matchingPreset(week: WeekSchedule): PresetKey | null {
  const isWeekday = (day: DayKey) => !WEEKEND.includes(day);

  if (
    MONDAY_FIRST.every((day) =>
      isWeekday(day)
        ? week[day].enabled && week[day].start === "09:00" && week[day].end === "17:00"
        : !week[day].enabled,
    )
  ) {
    return "weekdays";
  }

  if (MONDAY_FIRST.every((day) => week[day].enabled && week[day].start === "08:00" && week[day].end === "22:00")) {
    return "everyday";
  }

  if (MONDAY_FIRST.every((day) => (WEEKEND.includes(day) ? week[day].enabled : !week[day].enabled))) {
    return "weekends";
  }

  return null;
}
