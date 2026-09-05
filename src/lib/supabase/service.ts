import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Bypasses row-level security. Only use this in trusted server contexts
// with no user session, such as webhook handlers — never expose it to
// the browser or gate it behind a user-supplied request.
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
