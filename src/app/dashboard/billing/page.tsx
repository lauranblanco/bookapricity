import { getCurrentProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { SubscribeButton } from "./SubscribeButton";

export default async function BillingPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: club } = await supabase
    .from("clubs")
    .select("subscription_status")
    .eq("id", profile!.club_id!)
    .single();

  const status = club?.subscription_status ?? "inactive";
  const isActive = status === "active";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Billing</h1>

      <div className="rounded border border-gray-200 p-4">
        <p className="text-sm text-gray-600">Plan status</p>
        <p className="text-lg font-medium capitalize">{status}</p>
      </div>

      {!isActive && (
        <div className="flex flex-col gap-2">
          <p className="text-gray-700">
            Subscribe to unlock full access to BookApricity for your club.
          </p>
          <SubscribeButton />
        </div>
      )}
    </div>
  );
}
