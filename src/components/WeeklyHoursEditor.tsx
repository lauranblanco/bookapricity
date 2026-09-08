"use client";

import { useEffect, useRef, useState } from "react";
import type { DayKey } from "@/lib/booking/slots";
import {
  MONDAY_FIRST,
  DAY_LABELS,
  type DaySchedule,
  type WeekSchedule,
  timeToMinutes,
  minutesToTime,
  weeklyOpenMinutes,
  weeklySlotCount,
  formatHours,
  closedDaysLabel,
} from "@/lib/booking/hoursEditor";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { FieldLabel } from "@/components/Label";
import { cn } from "@/lib/cn";

const TRACK_START_HOUR = 6;
const TRACK_END_HOUR = 22;
const TRACK_SPAN_HOURS = TRACK_END_HOUR - TRACK_START_HOUR;

function pct(time: string) {
  const hours = timeToMinutes(time) / 60;
  return Math.min(Math.max(((hours - TRACK_START_HOUR) / TRACK_SPAN_HOURS) * 100, 0), 100);
}

const OPEN_TRACK_BG =
  "repeating-linear-gradient(to right, rgba(42,33,24,.09) 0 1px, transparent 1px 16.666%)";
const CLOSED_TRACK_BG = "repeating-linear-gradient(45deg, #F5EEE0 0 6px, #EBE1CE 6px 12px)";

export function WeeklyHoursEditor({
  hours,
  onChange,
  bookingDurationMinutes,
}: {
  hours: WeekSchedule;
  onChange: (day: DayKey, patch: Partial<DaySchedule>) => void;
  bookingDurationMinutes: number;
}) {
  const [editingDay, setEditingDay] = useState<DayKey | null>(null);
  const [dragging, setDragging] = useState<{ day: DayKey; edge: "start" | "end" } | null>(null);
  const trackRefs = useRef<Partial<Record<DayKey, HTMLDivElement | null>>>({});

  useEffect(() => {
    if (!dragging) return;

    function handleMove(e: PointerEvent) {
      const track = trackRefs.current[dragging!.day];
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      const rawMinutes = TRACK_START_HOUR * 60 + ratio * TRACK_SPAN_HOURS * 60;
      const snapped = Math.round(rawMinutes / 15) * 15;
      const schedule = hours[dragging!.day];

      if (dragging!.edge === "start") {
        const max = timeToMinutes(schedule.end) - 15;
        const next = Math.min(Math.max(snapped, TRACK_START_HOUR * 60), max);
        onChange(dragging!.day, { start: minutesToTime(next) });
      } else {
        const min = timeToMinutes(schedule.start) + 15;
        const next = Math.max(Math.min(snapped, TRACK_END_HOUR * 60), min);
        onChange(dragging!.day, { end: minutesToTime(next) });
      }
    }

    function handleUp() {
      setDragging(null);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragging, hours, onChange]);

  function copyMondayToWeekdays() {
    const monday = hours.mon;
    for (const day of ["tue", "wed", "thu", "fri"] as DayKey[]) {
      onChange(day, { enabled: monday.enabled, start: monday.start, end: monday.end });
    }
  }

  function clearAll() {
    for (const day of MONDAY_FIRST) onChange(day, { enabled: false });
  }

  const openMinutes = weeklyOpenMinutes(hours);
  const slotCount = weeklySlotCount(hours, bookingDurationMinutes);
  const closedLabel = closedDaysLabel(hours);

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[.1em] text-tinta">
          Available hours
        </span>
        <div className="flex gap-2.5">
          <Button
            type="button"
            variant="ghost"
            onClick={copyMondayToWeekdays}
            className="!px-1 !py-0.5 text-[11.5px]"
          >
            Copy Monday to weekdays
          </Button>
          <Button type="button" variant="ghost" onClick={clearAll} className="!px-1 !py-0.5 text-[11.5px]">
            Clear all
          </Button>
        </div>
      </div>

      <div className="mt-1 border border-[rgba(42,33,24,0.2)] bg-white">
        <div className="grid grid-cols-[112px_1fr] border-b border-[rgba(42,33,24,0.15)] bg-crema-100">
          <div />
          <div className="grid grid-cols-6 py-1.5 font-sans text-[9.5px] text-tinta-600">
            <span>6</span>
            <span>9</span>
            <span>12</span>
            <span>15</span>
            <span>18</span>
            <span>21</span>
          </div>
        </div>

        {MONDAY_FIRST.map((day) => {
          const schedule = hours[day];
          const isEditing = editingDay === day;

          return (
            <div key={day} className="border-b border-[rgba(42,33,24,0.1)] last:border-b-0">
              <div className="grid min-h-11 grid-cols-[112px_1fr] items-center">
                <div className="flex items-center gap-2 px-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={schedule.enabled}
                    aria-label={`${DAY_LABELS[day]} open`}
                    onClick={() => onChange(day, { enabled: !schedule.enabled })}
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 border-2 border-umbral",
                      schedule.enabled && "bg-umbral",
                    )}
                  />
                  <span
                    className={cn(
                      "font-heading text-xs font-semibold",
                      schedule.enabled ? "text-tinta" : "text-tinta-600",
                    )}
                  >
                    {DAY_LABELS[day]}
                  </span>
                </div>

                <div
                  ref={(el) => {
                    trackRefs.current[day] = el;
                  }}
                  className="relative h-11 mr-3"
                >
                  <div
                    className="absolute inset-0"
                    style={{ backgroundImage: schedule.enabled ? OPEN_TRACK_BG : CLOSED_TRACK_BG }}
                  />
                  {schedule.enabled && (
                    <div
                      className="absolute top-[9px] bottom-[9px] bg-umbral"
                      style={{ left: `${pct(schedule.start)}%`, width: `${pct(schedule.end) - pct(schedule.start)}%` }}
                    >
                      <button
                        type="button"
                        aria-pressed={isEditing}
                        onClick={() => setEditingDay(isEditing ? null : day)}
                        className="flex h-full w-full items-center justify-between px-2"
                      >
                        <span className="font-mono text-[10.5px] font-medium text-crema">
                          {schedule.start}
                        </span>
                        <span className="font-mono text-[10.5px] font-medium text-crema">
                          {schedule.end}
                        </span>
                      </button>
                      <div
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragging({ day, edge: "start" });
                        }}
                        className="absolute inset-y-0 left-0 w-2 cursor-ew-resize"
                      />
                      <div
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragging({ day, edge: "end" });
                        }}
                        className="absolute inset-y-0 right-0 w-2 cursor-ew-resize"
                      />
                    </div>
                  )}
                </div>
              </div>

              {isEditing && schedule.enabled && (
                <div className="flex items-end gap-2 bg-crema-100 py-2 pl-[124px] pr-3">
                  <label className="flex flex-col gap-1">
                    <FieldLabel>From</FieldLabel>
                    <Input
                      type="time"
                      value={schedule.start}
                      onChange={(e) => onChange(day, { start: e.target.value })}
                      className="w-[110px]"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <FieldLabel>To</FieldLabel>
                    <Input
                      type="time"
                      value={schedule.end}
                      onChange={(e) => onChange(day, { end: e.target.value })}
                      className="w-[110px]"
                    />
                  </label>
                </div>
              )}
            </div>
          );
        })}

        <div className="flex items-center justify-between bg-crema-100 px-3 py-2.5">
          <span className="font-sans text-[11.5px] text-tinta-800">
            Open <strong>{formatHours(openMinutes)} h</strong> per week · generates{" "}
            <strong>{slotCount} slots</strong> of {bookingDurationMinutes} min
          </span>
          {closedLabel && (
            <span className="font-mono text-[10px] font-medium uppercase tracking-[.09em] text-resol-700">
              {closedLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
