import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/public";

/**
 * Server-side gate for /admin pages and all write actions. Redirects when the
 * caller is not an authenticated admin; returns the session-bound client
 * otherwise, so writes also pass through RLS as that user.
 */
export async function requireAdmin() {
  if (!isSupabaseConfigured()) redirect("/login?reason=unconfigured");
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/login?reason=forbidden");
  return { supabase, user };
}
