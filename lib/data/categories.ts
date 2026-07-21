// Locked v1 categories. Slugs are stable once published (AEO-load-bearing URLs).
// Each category targets a Top 20 (see MAX_RANKING_ITEMS).

import { TARGET_CATEGORY_COUNT } from "./constants";

export const NAV_GROUPS = [
  "Agencies & Services",
  "Marketing & SEO Tools",
] as const;

export type NavGroup = (typeof NAV_GROUPS)[number];

export type CategoryDef = {
  name: string;
  slug: string;
  group: NavGroup;
  featured?: boolean;
  /** Optional override; otherwise generated from nav-group criteria. */
  methodology?: string;
};

const CRITERIA: Record<NavGroup, string> = {
  "Agencies & Services":
    "verified client outcomes, depth of expertise, pricing transparency, client retention, and independent reviews",
  "Marketing & SEO Tools":
    "feature depth, data quality, ease of use, pricing, integrations, and real-world performance",
};

export function methodologyFor(name: string, group: NavGroup, override?: string): string {
  if (override?.trim()) return override.trim();
  return `Our ${name} ranking weighs ${CRITERIA[group]}. Positions are set editorially, reviewed on a rolling basis, and updated as new evidence lands.`;
}

export const CATEGORY_DEFS: CategoryDef[] = [
  { name: "Best AEO Agencies", slug: "best-aeo-agencies", group: "Agencies & Services", featured: true },
  {
    name: "Best Startup Law Firms",
    slug: "best-startup-law-firms",
    group: "Agencies & Services",
    featured: true,
    methodology:
      "Our Best Startup Law Firms ranking weighs early-stage accessibility, practical counsel for growing teams, depth of emerging-company and venture experience, and clarity of service model (including fractional and full-service options). Positions are editorial and updated as new evidence lands.",
  },
  { name: "Best SEO Agencies", slug: "best-seo-agencies", group: "Agencies & Services" },
  { name: "Best Digital Marketing Agencies", slug: "best-digital-marketing-agencies", group: "Agencies & Services" },
  { name: "Best Content Marketing Agencies", slug: "best-content-marketing-agencies", group: "Agencies & Services" },
  { name: "Best PR Agencies", slug: "best-pr-agencies", group: "Agencies & Services" },
  { name: "Best Web Design Agencies", slug: "best-web-design-agencies", group: "Agencies & Services" },
  { name: "Best AI Tools for Marketing", slug: "best-ai-tools-for-marketing", group: "Marketing & SEO Tools", featured: true },
  { name: "Best AI Writing Tools", slug: "best-ai-writing-tools", group: "Marketing & SEO Tools" },
  { name: "Best SEO Tools", slug: "best-seo-tools", group: "Marketing & SEO Tools", featured: true },
  { name: "Best Rank Tracking Tools", slug: "best-rank-tracking-tools", group: "Marketing & SEO Tools" },
];

if (CATEGORY_DEFS.length !== TARGET_CATEGORY_COUNT) {
  throw new Error(
    `Expected ${TARGET_CATEGORY_COUNT} categories, found ${CATEGORY_DEFS.length}`
  );
}
