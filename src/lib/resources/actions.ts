"use server";

import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { type AvailableHours } from "@/lib/booking/slots";
import { revalidatePath } from "next/cache";

export type ResourceInput = {
  name: string;
  description: string;
  capacity: number;
  bookingDurationMinutes: number;
  cancellationCutoffMinutes: number;
  availableHours: AvailableHours;
};

export async function createResource(input: ResourceInput) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin" || !profile.club_id) {
    return { error: "Not authorized" };
  }

  const supabase = createClient();
  const { error } = await supabase.from("resources").insert({
    club_id: profile.club_id,
    name: input.name,
    description: input.description,
    capacity: input.capacity,
    booking_duration_minutes: input.bookingDurationMinutes,
    cancellation_cutoff_minutes: input.cancellationCutoffMinutes,
    available_hours: input.availableHours,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/resources");
  return {};
}

export async function deleteResource(resourceId: string) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin" || !profile.club_id) {
    return { error: "Not authorized" };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("resources")
    .delete()
    .eq("id", resourceId)
    .eq("club_id", profile.club_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/resources");
  return {};
}

export async function updateResource(resourceId: string, input: ResourceInput) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin" || !profile.club_id) {
    return { error: "Not authorized" };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("resources")
    .update({
      name: input.name,
      description: input.description,
      capacity: input.capacity,
      booking_duration_minutes: input.bookingDurationMinutes,
      cancellation_cutoff_minutes: input.cancellationCutoffMinutes,
      available_hours: input.availableHours,
    })
    .eq("id", resourceId)
    .eq("club_id", profile.club_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/resources");
  return {};
}
