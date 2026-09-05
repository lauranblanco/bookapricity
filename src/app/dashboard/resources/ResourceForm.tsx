"use client";

import { createResource, updateResource, type ResourceInput } from "@/lib/resources/actions";
import { DAY_KEYS, type AvailableHours, type DayKey } from "@/lib/booking/slots";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DAY_LABELS: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

type DaySchedule = { enabled: boolean; start: string; end: string };

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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Name</span>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">Capacity</span>
          <input
            type="number"
            min={1}
            required
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="rounded border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">Booking duration (min)</span>
          <input
            type="number"
            min={5}
            step={5}
            required
            value={bookingDurationMinutes}
            onChange={(e) => setBookingDurationMinutes(Number(e.target.value))}
            className="rounded border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">Cancellation cutoff (min)</span>
          <input
            type="number"
            min={0}
            step={5}
            required
            value={cancellationCutoffMinutes}
            onChange={(e) => setCancellationCutoffMinutes(Number(e.target.value))}
            className="rounded border border-gray-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Available hours</span>
        {DAY_KEYS.map((day) => (
          <div key={day} className="flex items-center gap-3">
            <label className="flex w-32 items-center gap-2">
              <input
                type="checkbox"
                checked={days[day].enabled}
                onChange={(e) => updateDay(day, { enabled: e.target.checked })}
              />
              <span className="text-sm">{DAY_LABELS[day]}</span>
            </label>
            <input
              type="time"
              disabled={!days[day].enabled}
              value={days[day].start}
              onChange={(e) => updateDay(day, { start: e.target.value })}
              className="rounded border border-gray-300 px-2 py-1 disabled:opacity-40"
            />
            <span className="text-sm text-gray-500">to</span>
            <input
              type="time"
              disabled={!days[day].enabled}
              value={days[day].end}
              onChange={(e) => updateDay(day, { end: e.target.value })}
              className="rounded border border-gray-300 px-2 py-1 disabled:opacity-40"
            />
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="self-start rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : mode === "create" ? "Create resource" : "Save changes"}
      </button>
    </form>
  );
}
