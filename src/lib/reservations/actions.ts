"use server";

import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { isWithinAvailableHours, type AvailableHours } from "@/lib/booking/slots";
import { revalidatePath } from "next/cache";

export async function createReservation(resourceId: string, startTimeIso: string) {
  const profile = await getCurrentProfile();

  if (!profile || !profile.club_id) {
    return { error: "Not authorized" };
  }

  const supabase = createClient();

  const { data: resource, error: resourceError } = await supabase
    .from("resources")
    .select("id, booking_duration_minutes, available_hours")
    .eq("id", resourceId)
    .eq("club_id", profile.club_id)
    .single();

  if (resourceError || !resource) {
    return { error: "Resource not found" };
  }

  const start = new Date(startTimeIso);
  const end = new Date(start.getTime() + resource.booking_duration_minutes * 60_000);

  if (start.getTime() < Date.now()) {
    return { error: "Cannot book a time slot in the past" };
  }

  if (!isWithinAvailableHours(resource.available_hours as AvailableHours, start, end)) {
    return { error: "Selected time is outside this resource's available hours" };
  }

  const { error } = await supabase.from("reservations").insert({
    resource_id: resourceId,
    member_id: profile.id,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/book");
  revalidatePath("/my-reservations");
  return {};
}

export async function cancelReservation(reservationId: string) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return { error: "Not authorized" };
  }

  const supabase = createClient();

  const { data: reservation, error: fetchError } = await supabase
    .from("reservations")
    .select("id, member_id, start_time, resources(cancellation_cutoff_minutes)")
    .eq("id", reservationId)
    .single();

  if (fetchError || !reservation) {
    return { error: "Reservation not found" };
  }

  const isOwningMember = reservation.member_id === profile.id;
  const isClubAdmin = profile.role === "admin";

  if (!isOwningMember && !isClubAdmin) {
    return { error: "Not authorized" };
  }

  if (isOwningMember && !isClubAdmin) {
    const cutoffMinutes = (
      reservation.resources as unknown as { cancellation_cutoff_minutes: number } | null
    )?.cancellation_cutoff_minutes ?? 0;
    const cutoffTime = new Date(reservation.start_time).getTime() - cutoffMinutes * 60_000;

    if (Date.now() > cutoffTime) {
      return { error: "The cancellation cutoff for this reservation has passed" };
    }
  }

  const { error } = await supabase
    .from("reservations")
    .update({ status: "cancelled" })
    .eq("id", reservationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/book");
  revalidatePath("/my-reservations");
  revalidatePath("/dashboard");
  return {};
}
