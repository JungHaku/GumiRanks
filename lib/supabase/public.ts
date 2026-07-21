// Cookie-free anon client for public reads. Public pages must use this (not
// the cookie-bound server client) so they stay statically renderable / ISR.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function supabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

export function isSupabaseConfigured(): boolean {
  return supabaseEnv() !== null;
}

export function createPublicClient(): SupabaseClient {
  const env = supabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return createClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
