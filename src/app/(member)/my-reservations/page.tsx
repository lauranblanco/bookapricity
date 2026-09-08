import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { CancelReservationButton } from "@/components/CancelReservationButton";
import { Badge } from "@/components/Badge";
import { LinkButton } from "@/components/Button";
import { cancellationStatus, formatDateLabel, formatTime } from "@/lib/booking/present";

export default async function MyReservationsPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, start_time, end_time, status, resources(name, cancellation_cutoff_minutes)")
    .eq("member_id", profile!.id)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  const upcoming = reservations ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading text-[30px] font-medium tracking-[-.012em] text-tinta">
        My reservations
      </h2>

      {upcoming.length > 0 && (
        <div className="border border-[rgba(42,33,24,0.2)] bg-white">
          {upcoming.map((reservation, index) => {
            const resource = reservation.resources as unknown as {
              name: string;
              cancellation_cutoff_minutes: number;
            } | null;
            const start = new Date(reservation.start_time);
            const end = new Date(reservation.end_time);
            const cutoff = resource
              ? cancellationStatus(reservation.start_time, resource.cancellation_cutoff_minutes)
              : { canCancel: false, text: "" };

            return (
              <div
                key={reservation.id}
                className={index > 0 ? "border-t border-[rgba(42,33,24,0.12)] p-3.5" : "p-3.5"}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div>
                    <div className="font-heading text-[15px] font-semibold text-tinta">
                      {resource?.name}
                    </div>
                    <div className="mt-0.5 text-[12.5px] text-tinta-800">
                      {formatDateLabel(start)} · {formatTime(start)} – {formatTime(end)}
                    </div>
                  </div>
                  <Badge tone="confirmed" className="whitespace-nowrap">
                    Confirmed
                  </Badge>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2.5">
                  <span className="text-[11.5px] text-tinta-600">{cutoff.text}</span>
                  <CancelReservationButton
                    reservationId={reservation.id}
                    disabled={!cutoff.canCancel}
                    disabledReason={cutoff.text}
                    bordered
                    className="min-h-11"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {upcoming.length === 0 && <EmptyState clubId={profile!.club_id!} />}
    </div>
  );
}

async function EmptyState({ clubId }: { clubId: string }) {
  const supabase = createClient();

  const { data: firstResource } = await supabase
    .from("resources")
    .select("name")
    .eq("club_id", clubId)
    .order("name")
    .limit(1)
    .maybeSingle();

  const helperText = firstResource
    ? `Your week is wide open. ${firstResource.name} has slots free — book one now.`
    : "Your week is wide open.";

  return (
    <div className="flex flex-col items-start gap-2.5 border border-dashed border-[rgba(42,33,24,0.35)] bg-white p-5">
      <div className="grid w-full grid-cols-7 gap-[3px]">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="h-1.5 bg-crema-200" />
        ))}
      </div>
      <h3 className="font-heading text-base font-semibold text-tinta">No upcoming reservations</h3>
      <p className="text-[12.5px] text-tinta-800">{helperText}</p>
      <LinkButton href="/book" variant="primary">
        Book a slot
      </LinkButton>
    </div>
  );
}
