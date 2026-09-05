import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { CancelReservationButton } from "@/components/CancelReservationButton";

export default async function DashboardReservationsPage({
  searchParams,
}: {
  searchParams: { resourceId?: string; date?: string };
}) {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: resources } = await supabase
    .from("resources")
    .select("id, name")
    .eq("club_id", profile!.club_id!)
    .order("name");

  let query = supabase
    .from("reservations")
    .select(
      "id, start_time, end_time, status, resources(id, name), users(email)",
    )
    .order("start_time", { ascending: true });

  if (searchParams.resourceId) {
    query = query.eq("resource_id", searchParams.resourceId);
  }

  if (searchParams.date) {
    const dayStart = new Date(`${searchParams.date}T00:00:00`);
    const dayEnd = new Date(`${searchParams.date}T23:59:59.999`);
    query = query.gte("start_time", dayStart.toISOString()).lte("start_time", dayEnd.toISOString());
  }

  const { data: reservations } = await query;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Reservations</h1>

      <form className="flex gap-4">
        <select
          name="resourceId"
          defaultValue={searchParams.resourceId ?? ""}
          className="rounded border border-gray-300 px-3 py-2"
        >
          <option value="">All resources</option>
          {resources?.map((resource) => (
            <option key={resource.id} value={resource.id}>
              {resource.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="date"
          defaultValue={searchParams.date ?? ""}
          className="rounded border border-gray-300 px-3 py-2"
        />

        <button
          type="submit"
          className="rounded border border-gray-300 px-4 py-2 text-sm"
        >
          Filter
        </button>
      </form>

      <div className="flex flex-col divide-y divide-gray-200 rounded border border-gray-200">
        {reservations?.length === 0 && (
          <p className="p-4 text-sm text-gray-600">No reservations found.</p>
        )}
        {reservations?.map((reservation) => {
          const resource = reservation.resources as unknown as {
            id: string;
            name: string;
          } | null;
          const member = reservation.users as unknown as { email: string } | null;

          return (
            <div
              key={reservation.id}
              className="flex items-center justify-between p-4"
            >
              <div>
                <p className="font-medium">{resource?.name}</p>
                <p className="text-sm text-gray-600">
                  {new Date(reservation.start_time).toLocaleString()} –{" "}
                  {new Date(reservation.end_time).toLocaleTimeString()}
                </p>
                <p className="text-sm text-gray-600">{member?.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm capitalize text-gray-600">
                  {reservation.status}
                </span>
                {reservation.status === "confirmed" && (
                  <CancelReservationButton reservationId={reservation.id} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
