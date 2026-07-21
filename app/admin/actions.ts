"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { MAX_RANKING_ITEMS } from "@/lib/data/constants";
import { slugify } from "@/lib/data/slug";

export type EditorItemInput = {
  name: string;
  blurb: string;
  score: string;
  url: string;
};

export type SaveRankingPayload = {
  name: string;
  methodology: string;
  featured: boolean;
  items: EditorItemInput[];
};

export type SaveResult = { ok: true } | { error: string };

/**
 * Saves category copy + the full ordered item list. Ranks are assigned from
 * array order server-side; the item replacement runs atomically in a
 * SECURITY INVOKER Postgres function, so RLS re-checks the admin role.
 * Category slugs are immutable by design (AEO-load-bearing URLs).
 */
export async function saveRanking(
  categorySlug: string,
  payload: SaveRankingPayload
): Promise<SaveResult> {
  const { supabase } = await requireAdmin();

  const name = String(payload?.name ?? "").trim();
  const methodology = String(payload?.methodology ?? "").trim();
  const featured = Boolean(payload?.featured);
  if (!name) return { error: "Category name is required." };

  const rawItems = Array.isArray(payload?.items) ? payload.items : [];
  if (rawItems.length === 0) return { error: "Add at least one ranked item." };
  if (rawItems.length > MAX_RANKING_ITEMS) {
    return { error: `A ranking holds at most ${MAX_RANKING_ITEMS} items.` };
  }

  const seenSlugs = new Set<string>();
  const items: {
    rank: number;
    name: string;
    slug: string;
    blurb: string;
    score: number | null;
    url: string | null;
  }[] = [];

  for (let i = 0; i < rawItems.length; i++) {
    const label = `Item ${i + 1}`;
    const itemName = String(rawItems[i]?.name ?? "").trim();
    if (!itemName) return { error: `${label} needs a name.` };

    const scoreRaw = String(rawItems[i]?.score ?? "").trim();
    let score: number | null = null;
    if (scoreRaw !== "") {
      const parsed = Number(scoreRaw);
      if (!Number.isFinite(parsed)) {
        return { error: `${label}: score must be a number (or blank).` };
      }
      if (Math.abs(parsed) > 9999.9) {
        return { error: `${label}: score must be between -9999.9 and 9999.9.` };
      }
      score = Math.round(parsed * 10) / 10;
    }

    const urlRaw = String(rawItems[i]?.url ?? "").trim();
    if (urlRaw && !/^https?:\/\//i.test(urlRaw)) {
      return { error: `${label}: URL must start with http:// or https://.` };
    }

    const base = slugify(itemName);
    let slug = base;
    for (let n = 2; seenSlugs.has(slug); n++) slug = `${base}-${n}`;
    seenSlugs.add(slug);

    items.push({
      rank: i + 1,
      name: itemName,
      slug,
      blurb: String(rawItems[i]?.blurb ?? "").trim(),
      score,
      url: urlRaw || null,
    });
  }

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();
  if (categoryError) return { error: categoryError.message };
  if (!category) return { error: "Category not found." };

  const { error: updateError } = await supabase
    .from("categories")
    .update({ name, methodology, featured })
    .eq("id", category.id);
  if (updateError) return { error: updateError.message };

  const { error: rpcError } = await supabase.rpc("replace_ranking_items", {
    p_category_id: category.id,
    p_items: items,
  });
  if (rpcError) return { error: rpcError.message };

  for (const path of [
    "/",
    "/rankings",
    `/rankings/${categorySlug}`,
    `/rankings/${categorySlug}/list`,
  ]) {
    revalidatePath(path);
  }

  return { ok: true };
}
