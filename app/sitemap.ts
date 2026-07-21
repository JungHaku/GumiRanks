import type { MetadataRoute } from "next";
import { getCategories } from "@/lib/data/rankings";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getCategories();
  const now = new Date();
  return [
    { url: SITE.url, lastModified: now },
    { url: `${SITE.url}/rankings`, lastModified: now },
    ...categories.flatMap((c) => [
      { url: `${SITE.url}/rankings/${c.slug}`, lastModified: now },
      { url: `${SITE.url}/rankings/${c.slug}/list`, lastModified: now },
    ]),
  ];
}
