import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_DEFS } from "@/lib/data/categories";
import { getCategoryBySlug, getRankingItems } from "@/lib/data/rankings";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/jsonld";
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
    title: `${category.name} — Top 20`,
    description: `${category.name}, ranked 1–20. ${category.methodology}`.slice(0, 160),
    alternates: { canonical: `/rankings/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const items = await getRankingItems(category);
  const top = items.slice(0, 10);
  const leaders = top.slice(0, 3).map((item) => item.name);
  const asOf = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="container">
      <JsonLd
        data={itemListJsonLd(category, top, `${SITE.url}/rankings/${category.slug}`)}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE.url },
          { name: "All rankings", url: `${SITE.url}/rankings` },
          { name: category.name, url: `${SITE.url}/rankings/${category.slug}` },
        ])}
      />
      <p className="crumbs">
        <Link href="/rankings">All rankings</Link> / {category.navGroup}
      </p>
      <div className="page-head">
        <p className="kicker">{category.navGroup}</p>
        <h1>{category.name}</h1>
        {leaders.length >= 3 ? (
          <p className="lede">
            As of {asOf}, {leaders[0]} ranks #1 in our {category.name} list,
            followed by {leaders[1]} and {leaders[2]}.
          </p>
        ) : null}
      </div>
      <div className="page-body">
        <section className="methodology">
          <h2>How we rank</h2>
          <p>{category.methodology}</p>
        </section>
        <h2 className="section-title">The top 10</h2>
        <RankTable items={top} />
        <div className="list-cta">
          <Link href={`/rankings/${category.slug}/list`} className="btn">
            See the full Top 20 →
          </Link>
        </div>
      </div>
    </div>
  );
}
