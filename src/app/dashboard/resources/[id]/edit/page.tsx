import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ResourceForm } from "../../ResourceForm";
import type { AvailableHours } from "@/lib/booking/slots";

export default async function EditResourcePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: resource } = await supabase
    .from("resources")
    .select(
      "id, name, description, capacity, booking_duration_minutes, cancellation_cutoff_minutes, available_hours",
    )
    .eq("id", params.id)
    .single();

  if (!resource) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit resource</h1>
      <ResourceForm
        mode="edit"
        resourceId={resource.id}
        initial={{
          name: resource.name,
          description: resource.description ?? "",
          capacity: resource.capacity,
          bookingDurationMinutes: resource.booking_duration_minutes,
          cancellationCutoffMinutes: resource.cancellation_cutoff_minutes,
          availableHours: resource.available_hours as AvailableHours,
        }}
      />
    </div>
  );
}
