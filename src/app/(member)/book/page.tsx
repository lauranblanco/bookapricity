import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { generateSlotsForDate, type AvailableHours } from "@/lib/booking/slots";
import { BookSlotButton } from "@/components/BookSlotButton";

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
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
    .select("id, name, capacity, booking_duration_minutes, available_hours")
    .eq("club_id", profile!.club_id!)
    .order("name");

  const dateString = searchParams.date ?? todayDateString();
  const selectedResource =
    resources?.find((r) => r.id === searchParams.resourceId) ?? resources?.[0];

  let slotsWithAvailability: { start: Date; end: Date; remaining: number }[] = [];

  if (selectedResource) {
    const date = new Date(`${dateString}T00:00:00`);
    const slots = generateSlotsForDate(
      selectedResource.available_hours as AvailableHours,
      selectedResource.booking_duration_minutes,
      date,
    );

    const dayStart = new Date(`${dateString}T00:00:00`);
    const dayEnd = new Date(`${dateString}T23:59:59.999`);

    const { data: existingReservations } = await supabase
      .from("reservations")
      .select("start_time")
      .eq("resource_id", selectedResource.id)
      .eq("status", "confirmed")
      .gte("start_time", dayStart.toISOString())
      .lte("start_time", dayEnd.toISOString());

    const countByStart = new Map<string, number>();
    for (const reservation of existingReservations ?? []) {
      const key = new Date(reservation.start_time).toISOString();
      countByStart.set(key, (countByStart.get(key) ?? 0) + 1);
    }

    slotsWithAvailability = slots.map((slot) => ({
      ...slot,
      remaining:
        selectedResource.capacity - (countByStart.get(slot.start.toISOString()) ?? 0),
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Book a slot</h1>

      <form className="flex gap-4">
        <select
          name="resourceId"
          defaultValue={selectedResource?.id ?? ""}
          className="rounded border border-gray-300 px-3 py-2"
        >
          {resources?.map((resource) => (
            <option key={resource.id} value={resource.id}>
              {resource.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="date"
          defaultValue={dateString}
          className="rounded border border-gray-300 px-3 py-2"
        />

        <button
          type="submit"
          className="rounded border border-gray-300 px-4 py-2 text-sm"
        >
          Show slots
        </button>
      </form>

      {!selectedResource && (
        <p className="text-sm text-gray-600">No resources available yet.</p>
      )}

      {selectedResource && slotsWithAvailability.length === 0 && (
        <p className="text-sm text-gray-600">
          {selectedResource.name} has no available hours on this day.
        </p>
      )}

      {selectedResource && slotsWithAvailability.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {slotsWithAvailability.map((slot) => {
            const isPast = slot.start.getTime() < Date.now();
            const isFull = slot.remaining <= 0;
            const label = slot.start.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <BookSlotButton
                key={slot.start.toISOString()}
                resourceId={selectedResource.id}
                startIso={slot.start.toISOString()}
                label={isFull ? `${label} (full)` : label}
                disabled={isPast || isFull}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
