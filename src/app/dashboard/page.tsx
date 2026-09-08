import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { CancelReservationButton } from "@/components/CancelReservationButton";
import { Select } from "@/components/Select";
import { Input } from "@/components/Input";
import { Button, LinkButton } from "@/components/Button";
import { FieldLabel } from "@/components/Label";
import { Badge } from "@/components/Badge";
import { BrandMark } from "@/components/BrandMark";
import { Table, TableHead, TableHeaderCell, TableRow, TableCell } from "@/components/Table";
import { formatDateLabel, formatTime } from "@/lib/booking/present";

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

  const { data } = await query;
  const reservations = (data ?? []).map((reservation) => ({
    ...reservation,
    resource: reservation.resources as unknown as { id: string; name: string } | null,
    member: reservation.users as unknown as { email: string } | null,
    start: new Date(reservation.start_time),
    end: new Date(reservation.end_time),
    isCancelled: reservation.status === "cancelled",
  }));
  const confirmedCount = reservations.filter((r) => r.status === "confirmed").length;
  const cancelledCount = reservations.filter((r) => r.status === "cancelled").length;

  const filteredResourceName = resources?.find((r) => r.id === searchParams.resourceId)?.name;
  const hasFilters = Boolean(searchParams.resourceId || searchParams.date);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between border-b-2 border-[rgba(42,33,24,0.4)] pb-3">
        <h2 className="font-heading text-[30px] font-medium tracking-[-.012em] text-tinta">
          Reservations
        </h2>
        <span className="font-mono text-[11px] font-medium uppercase tracking-[.09em] text-tinta-600">
          {confirmedCount} confirmed · {cancelledCount} cancelled
        </span>
      </div>

      <form className="flex flex-wrap items-end gap-2.5">
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Resource</FieldLabel>
          <Select name="resourceId" defaultValue={searchParams.resourceId ?? ""} className="w-[190px]">
            <option value="">All resources</option>
            {resources?.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="flex flex-col gap-1.5">
          <FieldLabel>Date</FieldLabel>
          <Input type="date" name="date" defaultValue={searchParams.date ?? ""} className="w-[160px]" />
        </label>

        <Button type="submit" variant="primary">
          Filter
        </Button>
        <LinkButton href="/dashboard" variant="ghost">
          Reset
        </LinkButton>
      </form>

      {reservations.length > 0 && (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell>Resource</TableHeaderCell>
                  <TableHeaderCell>Time</TableHeaderCell>
                  <TableHeaderCell>Member</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell />
                </tr>
              </TableHead>
              <tbody>
                {reservations.map(({ id, resource, member, start, end, isCancelled }) => (
                  <TableRow key={id} muted={isCancelled}>
                    <TableCell className="font-heading text-[13px] font-semibold">
                      {resource?.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span
                        className={
                          isCancelled ? "font-mono font-medium" : "font-mono font-medium text-tinta"
                        }
                      >
                        {formatTime(start)} – {formatTime(end)}
                      </span>{" "}
                      <span className={isCancelled ? "" : "text-tinta-600"}>
                        {formatDateLabel(start)}
                      </span>
                    </TableCell>
                    <TableCell>{member?.email}</TableCell>
                    <TableCell>
                      <Badge tone={isCancelled ? "cancelled" : "confirmed"}>
                        {isCancelled ? "Cancelled" : "Confirmed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!isCancelled && <CancelReservationButton reservationId={id} />}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="flex flex-col divide-y divide-[rgba(42,33,24,0.12)] border border-[rgba(42,33,24,0.2)] bg-white md:hidden">
            {reservations.map(({ id, resource, member, start, end, isCancelled }) => (
              <div key={id} className={isCancelled ? "bg-[#FCFAF5] p-3.5 text-tinta-600" : "p-3.5"}>
                <div className="flex items-start justify-between gap-2.5">
                  <div>
                    <div className="font-heading text-[13px] font-semibold">{resource?.name}</div>
                    <div className="mt-0.5 whitespace-nowrap">
                      <span className={isCancelled ? "font-mono font-medium" : "font-mono font-medium text-tinta"}>
                        {formatTime(start)} – {formatTime(end)}
                      </span>{" "}
                      <span className={isCancelled ? "" : "text-tinta-600"}>
                        {formatDateLabel(start)}
                      </span>
                    </div>
                  </div>
                  <Badge tone={isCancelled ? "cancelled" : "confirmed"}>
                    {isCancelled ? "Cancelled" : "Confirmed"}
                  </Badge>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2.5">
                  <span className="text-[13px]">{member?.email}</span>
                  {!isCancelled && <CancelReservationButton reservationId={id} />}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {reservations.length === 0 && (
        <div className="flex flex-col items-start gap-2.5 border border-dashed border-[rgba(42,33,24,0.35)] bg-white p-5">
          <BrandMark size={34} className="opacity-50" />
          <h3 className="font-heading text-base font-semibold text-tinta">No reservations found</h3>
          <p className="text-[12.5px] text-tinta-800">
            {hasFilters
              ? `Nothing booked${filteredResourceName ? ` for ${filteredResourceName}` : ""}${
                  searchParams.date ? ` on ${formatDateLabel(new Date(`${searchParams.date}T00:00:00`))}` : ""
                }. Try another date, or check the resource's available hours.`
              : "No reservations yet."}
          </p>
          {hasFilters && (
            <LinkButton href="/dashboard" variant="secondary">
              Clear filters
            </LinkButton>
          )}
        </div>
      )}
    </div>
  );
}
