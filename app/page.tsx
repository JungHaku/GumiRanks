import Image from "next/image";
import Link from "next/link";
import { getCategories, getRankingItems, groupCategories } from "@/lib/data/rankings";
import { webSiteJsonLd } from "@/lib/jsonld";
import { JsonLd } from "@/components/json-ld";
import { GUMI, SITE } from "@/lib/site";

export const revalidate = 300;

export default async function HomePage() {
  const categories = await getCategories();
  const featured = categories.filter((c) => c.featured).slice(0, 4);
  const featuredTops = await Promise.all(
    featured.map(async (category) => ({
      category,
      top: (await getRankingItems(category)).slice(0, 3),
    }))
  );
  const groups = groupCategories(categories);

  return (
    <>
      <JsonLd data={webSiteJsonLd()} />
      <section className="hero">
        <div className="container hero-gumi">
          <div className="hero-copy">
            <p className="kicker">Meet the ranker</p>
            <h1>{GUMI.greeting}</h1>
            <p className="lede">{GUMI.intro}</p>
            <p className="hero-aside">
              Welcome to <strong>{SITE.name}</strong> — Gumi&apos;s top-20
              ledgers, each with a methodology you can read.
            </p>
            <Link href="/rankings" className="btn">
              Browse rankings
            </Link>
          </div>
          <figure className="hero-mascot">
            <Image
              src={GUMI.image}
              alt="Gumi, a friendly robot ranking assistant, waving hello"
              width={420}
              height={420}
              priority
              className="gumi-portrait"
            />
            <figcaption>Gumi · AI ranker with human assistance</figcaption>
          </figure>
        </div>
      </section>

      {featuredTops.length > 0 ? (
        <section className="home-section">
          <div className="container">
            <h2 className="section-title">Gumi&apos;s featured rankings</h2>
            <div className="featured-grid">
              {featuredTops.map(({ category, top }) => (
                <Link
                  key={category.slug}
                  href={`/rankings/${category.slug}`}
                  className="featured-card"
                >
                  <p className="kicker">{category.navGroup}</p>
                  <h3>{category.name}</h3>
                  <ol>
                    {top.map((item) => (
                      <li key={item.id}>
                        <span className="n">{item.rank}</span>
                        <span>{item.name}</span>
                      </li>
                    ))}
                  </ol>
                  <span className="more">See the Top 20 →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="home-section">
        <div className="container">
          <h2 className="section-title">Browse by group</h2>
          {groups.map((g) => (
            <section key={g.group} className="group-section">
              <h3 className="kicker">{g.group}</h3>
              <div className="group-grid">
                {g.categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/rankings/${c.slug}`}
                    className="cat-link"
                  >
                    <span>{c.name}</span>
                    <span className="arrow">Top 20 →</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
