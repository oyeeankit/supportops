"use client";

import { createBrowserClient } from "@supabase/ssr";
import { assertSupabaseConfigured } from "./env";

export function createClient() {
  const { url, anonKey } = assertSupabaseConfigured();
  return createBrowserClient(url, anonKey);
}
