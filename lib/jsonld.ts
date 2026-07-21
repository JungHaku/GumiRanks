// Structured data builders — ItemList JSON-LD is the highest-leverage AEO
// signal for a ranking site, so every category page emits it.
import { SITE } from "./site";
import type { Category, RankingItem } from "./data/types";

export function itemListJsonLd(
  category: Category,
  items: RankingItem[],
  pageUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    description: category.methodology,
    url: pageUrl,
    numberOfItems: items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.rank,
      name: item.name,
      ...(item.url ? { url: item.url } : {}),
    })),
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
  };
}
