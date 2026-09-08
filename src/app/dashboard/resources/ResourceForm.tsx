"use client";

import { createResource, updateResource, deleteResource, type ResourceInput } from "@/lib/resources/actions";
import { DAY_KEYS, type AvailableHours, type DayKey } from "@/lib/booking/slots";
import type { DaySchedule } from "@/lib/booking/hoursEditor";
import { WeeklyHoursEditor } from "@/components/WeeklyHoursEditor";
import { HoursPresetEditor } from "@/components/HoursPresetEditor";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { FieldLabel } from "@/components/Label";
import { ErrorBlock } from "@/components/ErrorBlock";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];
const CUTOFF_OPTIONS = [0, 15, 30, 60, 120, 240, 1440];

function withCurrent(options: number[], current: number) {
  return options.includes(current) ? options : [...options, current].sort((a, b) => a - b);
}

function durationLabel(minutes: number) {
  return `${minutes} minutes`;
}

function cutoffLabel(minutes: number) {
  if (minutes === 0) return "No cutoff";
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hour${hours > 1 ? "s" : ""} before`;
  }
  return `${minutes} minutes before`;
}

function initialDaySchedules(availableHours?: AvailableHours): Record<DayKey, DaySchedule> {
  const schedules = {} as Record<DayKey, DaySchedule>;
  for (const day of DAY_KEYS) {
    const window = availableHours?.[day]?.[0];
    schedules[day] = window
      ? { enabled: true, start: window[0], end: window[1] }
      : { enabled: false, start: "09:00", end: "17:00" };
  }
  return schedules;
}

export function ResourceForm({
  mode,
  resourceId,
  initial,
}: {
  mode: "create" | "edit";
  resourceId?: string;
  initial?: {
    name: string;
    description: string;
    capacity: number;
    bookingDurationMinutes: number;
    cancellationCutoffMinutes: number;
    availableHours: AvailableHours;
  };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [capacity, setCapacity] = useState(initial?.capacity ?? 1);
  const [bookingDurationMinutes, setBookingDurationMinutes] = useState(
    initial?.bookingDurationMinutes ?? 60,
  );
  const [cancellationCutoffMinutes, setCancellationCutoffMinutes] = useState(
    initial?.cancellationCutoffMinutes ?? 60,
  );
  const [days, setDays] = useState<Record<DayKey, DaySchedule>>(
    initialDaySchedules(initial?.availableHours),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function updateDay(day: DayKey, patch: Partial<DaySchedule>) {
    setDays((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const availableHours: AvailableHours = {};
    for (const day of DAY_KEYS) {
      const schedule = days[day];
      availableHours[day] = schedule.enabled ? [[schedule.start, schedule.end]] : [];
    }

    const input: ResourceInput = {
      name,
      description,
      capacity,
      bookingDurationMinutes,
      cancellationCutoffMinutes,
      availableHours,
    };

    const result =
      mode === "create"
        ? await createResource(input)
        : await updateResource(resourceId!, input);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/dashboard/resources");
    router.refresh();
  }

  async function handleDelete() {
    if (!resourceId) return;
    if (!window.confirm("Delete this resource and all its reservations? This can't be undone.")) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    const result = await deleteResource(resourceId);

    setIsDeleting(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.push("/dashboard/resources");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between border-b-2 border-[rgba(42,33,24,0.4)] pb-2.5">
        <h3 className="font-heading text-2xl font-medium tracking-[-.012em] text-tinta">
          {mode === "create" ? "New resource" : "Edit resource"}
        </h3>
        {initial?.name && (
          <span className="font-mono text-[10px] font-medium uppercase tracking-[.1em] text-tinta-600">
            {initial.name}
          </span>
        )}
      </div>

      <label className="flex flex-col gap-1.5">
        <FieldLabel>Name</FieldLabel>
        <Input required value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="flex flex-col gap-1.5">
        <FieldLabel>Description</FieldLabel>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-none border border-[rgba(42,33,24,0.3)] bg-white px-[11px] py-[9px] font-sans text-[13px] text-tinta"
        />
      </label>

      <div className="grid grid-cols-2 gap-3.5">
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Capacity</FieldLabel>
          <Input
            type="number"
            min={1}
            required
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <FieldLabel>Slot duration</FieldLabel>
          <Select
            value={bookingDurationMinutes}
            onChange={(e) => setBookingDurationMinutes(Number(e.target.value))}
          >
            {withCurrent(DURATION_OPTIONS, bookingDurationMinutes).map((minutes) => (
              <option key={minutes} value={minutes}>
                {durationLabel(minutes)}
              </option>
            ))}
          </Select>
        </label>

        <label className="flex flex-col gap-1.5">
          <FieldLabel>Cancellation cutoff</FieldLabel>
          <Select
            value={cancellationCutoffMinutes}
            onChange={(e) => setCancellationCutoffMinutes(Number(e.target.value))}
          >
            {withCurrent(CUTOFF_OPTIONS, cancellationCutoffMinutes).map((minutes) => (
              <option key={minutes} value={minutes}>
                {cutoffLabel(minutes)}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div>
        <div className="hidden sm:block">
          <WeeklyHoursEditor hours={days} onChange={updateDay} bookingDurationMinutes={bookingDurationMinutes} />
        </div>
        <div className="sm:hidden">
          <HoursPresetEditor hours={days} onChange={updateDay} />
        </div>
      </div>

      {error && <ErrorBlock>{error}</ErrorBlock>}

      <div className="flex items-center gap-2.5">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : mode === "create" ? "Create resource" : "Save changes"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/resources")}>
          Cancel
        </Button>
        {mode === "edit" && (
          <Button
            type="button"
            variant="destructive"
            className="ml-auto"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete resource"}
          </Button>
        )}
      </div>
    </form>
  );
}
