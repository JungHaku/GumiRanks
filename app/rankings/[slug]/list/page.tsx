import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_DEFS } from "@/lib/data/categories";
import { getCategoryBySlug, getRankingItems } from "@/lib/data/rankings";
import { itemListJsonLd } from "@/lib/jsonld";
import { JsonLd } from "@/components/json-ld";
import { RankTable } from "@/components/rank-table";
import { SITE } from "@/lib/site";

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return CATEGORY_DEFS.map((def) => ({ slug: def.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name}: The Full Top 20`,
    description: `The complete ${category.name} ranking, positions 1–20, with our methodology.`.slice(0, 160),
    alternates: { canonical: `/rankings/${category.slug}/list` },
  };
}

export default async function CategoryListPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const items = await getRankingItems(category);

  return (
    <div className="container">
      <JsonLd
        data={itemListJsonLd(
          category,
          items,
          `${SITE.url}/rankings/${category.slug}/list`
        )}
      />
      <p className="crumbs">
        <Link href="/rankings">All rankings</Link> /{" "}
        <Link href={`/rankings/${category.slug}`}>{category.name}</Link> / Full
        list
      </p>
      <div className="page-head">
        <p className="kicker">{category.navGroup}</p>
        <h1>{category.name}: the full Top 20</h1>
        <p className="lede">{category.methodology}</p>
      </div>
      <div className="page-body">
        <RankTable items={items} />
      </div>
    </div>
  );
}
