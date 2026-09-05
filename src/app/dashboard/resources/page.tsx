import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ResourcesPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: resources } = await supabase
    .from("resources")
    .select("id, name, description, capacity, booking_duration_minutes")
    .eq("club_id", profile!.club_id!)
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Resources</h1>
        <Link
          href="/dashboard/resources/new"
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white"
        >
          Add resource
        </Link>
      </div>

      <div className="flex flex-col divide-y divide-gray-200 rounded border border-gray-200">
        {resources?.length === 0 && (
          <p className="p-4 text-sm text-gray-600">No resources yet.</p>
        )}
        {resources?.map((resource) => (
          <div key={resource.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{resource.name}</p>
              <p className="text-sm text-gray-600">{resource.description}</p>
              <p className="text-sm text-gray-500">
                Capacity {resource.capacity} · {resource.booking_duration_minutes} min slots
              </p>
            </div>
            <Link
              href={`/dashboard/resources/${resource.id}/edit`}
              className="text-sm underline"
            >
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
