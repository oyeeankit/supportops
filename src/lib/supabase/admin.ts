import "server-only";

import { createClient } from "@supabase/supabase-js";
import { assertSupabaseConfigured } from "./env";

export function createAdminClient() {
  const { url } = assertSupabaseConfigured();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for Manager employee actions.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
