// Read layer for rankings. Supabase when configured, bundled seed data
// otherwise — so the public site always renders on localhost.
import { NAV_GROUPS } from "./categories";
import { seedCategories, seedItemsFor } from "./seed";
import type { Category, RankingItem } from "./types";
import { createPublicClient, isSupabaseConfigured } from "@/lib/supabase/public";

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  nav_group: string;
  methodology: string;
  featured: boolean;
};

type ItemRow = {
  id: string;
  rank: number;
  name: string;
  slug: string;
  blurb: string;
  score: string | number | null;
  url: string | null;
};

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    navGroup: row.nav_group,
    methodology: row.methodology,
    featured: row.featured,
  };
}

function mapItem(row: ItemRow): RankingItem {
  return {
    id: row.id,
    rank: row.rank,
    name: row.name,
    slug: row.slug,
    blurb: row.blurb,
    score: row.score === null ? null : Number(row.score),
    url: row.url,
  };
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return seedCategories;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, nav_group, methodology, featured")
    .order("name");
  if (error) throw new Error(`Failed to load categories: ${error.message}`);
  return (data ?? []).map(mapCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!isSupabaseConfigured()) {
    return seedCategories.find((c) => c.slug === slug) ?? null;
  }
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, nav_group, methodology, featured")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Failed to load category: ${error.message}`);
  return data ? mapCategory(data) : null;
}

export async function getRankingItems(category: Category): Promise<RankingItem[]> {
  if (!isSupabaseConfigured()) return seedItemsFor(category.slug);
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("ranking_items")
    .select("id, rank, name, slug, blurb, score, url")
    .eq("category_id", category.id)
    .order("rank");
  if (error) throw new Error(`Failed to load ranking items: ${error.message}`);
  return (data ?? []).map(mapItem);
}

/** Groups categories in the canonical nav-group order. */
export function groupCategories(
  categories: Category[]
): { group: string; categories: Category[] }[] {
  const known = NAV_GROUPS.map((group) => ({
    group: group as string,
    categories: categories.filter((c) => c.navGroup === group),
  }));
  const extras = categories.filter(
    (c) => !NAV_GROUPS.includes(c.navGroup as (typeof NAV_GROUPS)[number])
  );
  if (extras.length > 0) known.push({ group: "More", categories: extras });
  return known.filter((g) => g.categories.length > 0);
}
