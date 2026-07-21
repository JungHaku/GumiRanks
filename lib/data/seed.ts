// Deterministic ranking data for localhost + seed script.
// Prefers Gemini CSV imports when present; otherwise placeholder rows.
import { CATEGORY_DEFS, methodologyFor } from "./categories";
import { MAX_RANKING_ITEMS } from "./constants";
import { importedRankings } from "./imported-rankings";
import { slugify } from "./slug";
import type { Category, RankingItem } from "./types";

export const seedCategories: Category[] = CATEGORY_DEFS.map((def) => ({
  id: `seed-${def.slug}`,
  slug: def.slug,
  name: def.name,
  navGroup: def.group,
  methodology: methodologyFor(def.name, def.group, def.methodology),
  featured: Boolean(def.featured),
}));

const ORG_PREFIXES = [
  "Alder",
  "Vantage",
  "Meridian",
  "Harbor",
  "Cobalt",
  "Juniper",
  "Summit",
  "Foundry",
  "Atlas",
  "Beacon",
];
const ORG_SUFFIXES = [
  "Partners",
  "Labs",
  "Collective",
  "Works",
  "Group",
  "Studio",
  "Digital",
  "Systems",
  "Advisors",
  "& Co.",
];

function offsetFor(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) % MAX_RANKING_ITEMS;
  }
  return hash;
}

function placeholderItems(categorySlug: string): RankingItem[] {
  const def = CATEGORY_DEFS.find((d) => d.slug === categorySlug);
  if (!def) return [];
  const offset = offsetFor(categorySlug);
  const items: RankingItem[] = [];
  for (let i = 0; i < MAX_RANKING_ITEMS; i++) {
    const rank = i + 1;
    const j = (i + offset) % 100;
    const name = `${ORG_PREFIXES[Math.floor(j / 10)]} ${ORG_SUFFIXES[j % 10]}`;
    items.push({
      id: `seed-${categorySlug}-${rank}`,
      rank,
      name,
      slug: slugify(name),
      blurb: `Placeholder entry for ${def.name}. Replace with a real profile: what ${name} does best, pricing posture, and who it fits.`,
      score: Math.round((99 - i * 2.5) * 10) / 10,
      url: null,
    });
  }
  return items;
}

export function seedItemsFor(categorySlug: string): RankingItem[] {
  return importedRankings[categorySlug] ?? placeholderItems(categorySlug);
}
