"use client";

import { useState } from "react";
import type { DayKey } from "@/lib/booking/slots";
import {
  SUNDAY_FIRST,
  applyPreset,
  matchingPreset,
  PRESET_LABELS,
  type DaySchedule,
  type PresetKey,
  type WeekSchedule,
} from "@/lib/booking/hoursEditor";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { FieldLabel } from "@/components/Label";
import { cn } from "@/lib/cn";

const PRESET_KEYS: PresetKey[] = ["weekdays", "everyday", "weekends"];
const DAY_LETTER: Record<DayKey, string> = {
  sun: "S",
  mon: "M",
  tue: "T",
  wed: "W",
  thu: "T",
  fri: "F",
  sat: "S",
};

export function HoursPresetEditor({
  hours,
  onChange,
}: {
  hours: WeekSchedule;
  onChange: (day: DayKey, patch: Partial<DaySchedule>) => void;
}) {
  const [showPerDay, setShowPerDay] = useState(false);

  const activePreset = matchingPreset(hours);
  const enabledDays = SUNDAY_FIRST.filter((day) => hours[day].enabled);
  const shared = enabledDays.length > 0 ? hours[enabledDays[0]] : null;

  function toggleDay(day: DayKey) {
    if (hours[day].enabled) {
      onChange(day, { enabled: false });
      return;
    }
    const reference = SUNDAY_FIRST.map((d) => hours[d]).find((d) => d.enabled);
    onChange(day, { enabled: true, start: reference?.start ?? "09:00", end: reference?.end ?? "17:00" });
  }

  function applySharedTime(patch: Partial<Pick<DaySchedule, "start" | "end">>) {
    for (const day of enabledDays) onChange(day, patch);
  }

  return (
    <div>
      <span className="font-mono text-[11px] font-medium uppercase tracking-[.1em] text-tinta">
        Available hours
      </span>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {PRESET_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              const next = applyPreset(key, hours);
              for (const day of SUNDAY_FIRST) {
                onChange(day, next[day]);
              }
            }}
            className={cn(
              "font-heading text-[11.5px] font-semibold px-[11px] py-[7px]",
              activePreset === key
                ? "bg-umbral text-crema"
                : "border border-[rgba(42,33,24,0.28)] bg-white text-tinta",
            )}
          >
            {PRESET_LABELS[key]}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowPerDay(true)}
          className={cn(
            "font-heading text-[11.5px] font-semibold px-[11px] py-[7px]",
            activePreset === null
              ? "bg-umbral text-crema"
              : "border border-[rgba(42,33,24,0.28)] bg-white text-tinta",
          )}
        >
          Custom…
        </button>
      </div>

      <div className="mt-3.5 border border-[rgba(42,33,24,0.2)] bg-white p-3.5">
        <div className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[.1em] text-tinta-600">
          Open on
        </div>
        <div className="grid grid-cols-7 gap-1">
          {SUNDAY_FIRST.map((day) => (
            <button
              key={day}
              type="button"
              aria-pressed={hours[day].enabled}
              aria-label={day}
              onClick={() => toggleDay(day)}
              className={cn(
                "min-h-11 font-heading text-[11px] font-semibold",
                hours[day].enabled ? "bg-umbral text-white" : "bg-crema-200 text-tinta-600",
              )}
            >
              {DAY_LETTER[day]}
            </button>
          ))}
        </div>

        {shared && !showPerDay && (
          <>
            <div className="mt-3.5 flex items-end gap-2">
              <label className="flex flex-1 flex-col gap-1">
                <FieldLabel>From</FieldLabel>
                <Input
                  type="time"
                  value={shared.start}
                  onChange={(e) => applySharedTime({ start: e.target.value })}
                />
              </label>
              <span className="pb-2.5 text-xs text-tinta-600">to</span>
              <label className="flex flex-1 flex-col gap-1">
                <FieldLabel>To</FieldLabel>
                <Input
                  type="time"
                  value={shared.end}
                  onChange={(e) => applySharedTime({ end: e.target.value })}
                />
              </label>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowPerDay(true)}
              className="mt-2 !px-0 text-[11.5px]"
            >
              + Different hours for one day
            </Button>
          </>
        )}

        {showPerDay && (
          <div className="mt-3.5 flex flex-col gap-2.5">
            {enabledDays.map((day) => (
              <div key={day} className="flex items-end gap-2">
                <span className="w-8 font-heading text-xs font-semibold text-tinta">
                  {DAY_LETTER[day]}
                </span>
                <label className="flex flex-1 flex-col gap-1">
                  <FieldLabel>From</FieldLabel>
                  <Input
                    type="time"
                    value={hours[day].start}
                    onChange={(e) => onChange(day, { start: e.target.value })}
                  />
                </label>
                <label className="flex flex-1 flex-col gap-1">
                  <FieldLabel>To</FieldLabel>
                  <Input
                    type="time"
                    value={hours[day].end}
                    onChange={(e) => onChange(day, { end: e.target.value })}
                  />
                </label>
              </div>
            ))}
            {enabledDays.length === 0 && (
              <p className="text-xs text-tinta-600">Pick at least one day above first.</p>
            )}
          </div>
        )}

        {!shared && (
          <p className="mt-3.5 text-xs text-tinta-600">Pick at least one day above to set hours.</p>
        )}
      </div>
    </div>
  );
}
