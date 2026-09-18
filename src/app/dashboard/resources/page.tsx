import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS, effectivePlan, type PlanId } from "@/lib/plans/limits";
import Link from "next/link";

export default async function ResourcesPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const [{ data: resources }, { data: club }] = await Promise.all([
    supabase
      .from("resources")
      .select("id, name, description, capacity, booking_duration_minutes")
      .eq("club_id", profile!.club_id!)
      .order("name"),
    supabase
      .from("clubs")
      .select("subscription_status, plan")
      .eq("id", profile!.club_id!)
      .single(),
  ]);

  const plan = effectivePlan((club?.plan as PlanId) ?? "free", club?.subscription_status ?? "inactive");
  const resourceLimit = PLAN_LIMITS[plan].resources;
  const atLimit = resourceLimit !== null && (resources?.length ?? 0) >= resourceLimit;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Resources</h1>
          <p className="text-sm text-gray-500">
            {resources?.length ?? 0} of {resourceLimit ?? "unlimited"} used
          </p>
        </div>
        {atLimit ? (
          <Link href="/dashboard/billing" className="text-sm underline">
            Upgrade to add more resources
          </Link>
        ) : (
          <Link
            href="/dashboard/resources/new"
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white"
          >
            Add resource
          </Link>
        )}
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
