import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { CancelReservationButton } from "@/components/CancelReservationButton";

export default async function MyReservationsPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, start_time, end_time, status, resources(name)")
    .eq("member_id", profile!.id)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">My reservations</h1>

      <div className="flex flex-col divide-y divide-gray-200 rounded border border-gray-200">
        {reservations?.length === 0 && (
          <p className="p-4 text-sm text-gray-600">No upcoming reservations.</p>
        )}
        {reservations?.map((reservation) => {
          const resource = reservation.resources as unknown as { name: string } | null;

          return (
            <div key={reservation.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{resource?.name}</p>
                <p className="text-sm text-gray-600">
                  {new Date(reservation.start_time).toLocaleString()} –{" "}
                  {new Date(reservation.end_time).toLocaleTimeString()}
                </p>
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
