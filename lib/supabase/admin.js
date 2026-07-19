import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVER-ONLY. This key bypasses Row Level Security entirely — never import
// this file from a Client Component, never expose SUPABASE_SERVICE_ROLE_KEY
// with a NEXT_PUBLIC_ prefix. Used only for the handful of operations a
// regular user's RLS-scoped session can't do for itself, like creating the
// very first church + admin profile during signup (see app/signup/actions.js
// and app/auth/callback/route.js).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
