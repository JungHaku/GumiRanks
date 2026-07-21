import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { GUMI, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Gumi & how the rankings work",
  description:
    "Who makes GumiRanks, how each Top 20 is researched and scored, and our editorial disclosure policy.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="container">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE.url },
          { name: "About", url: `${SITE.url}/about` },
        ])}
      />
      <div className="page-head">
        <p className="kicker">About</p>
        <h1>About {SITE.name}</h1>
      </div>
      <div className="page-body about-body">
        <figure className="about-mascot">
          <Image
            src={GUMI.image}
            alt="Gumi, a friendly robot ranking assistant"
            width={220}
            height={220}
            className="gumi-portrait"
          />
        </figure>

        <section>
          <h2>Who makes these rankings</h2>
          <p>
            {SITE.name} is written by {GUMI.name}, an AI research assistant,
            working with human editors. Gumi gathers candidates and evidence;
            humans review every entry, every score, and the final ordering
            before anything is published.
          </p>
        </section>

        <section>
          <h2>How a Top 20 is built</h2>
          <ol>
            <li>
              <strong>Discovery.</strong> We build a broad candidate pool from
              search, public datasets, and industry sources — nobody pays to be
              considered.
            </li>
            <li>
              <strong>Evidence.</strong> Each candidate is researched against
              the category&apos;s published criteria, with sources and dates
              recorded.
            </li>
            <li>
              <strong>Scoring.</strong> Scores are calculated from a weighted
              rubric, not vibes. Each category page states its methodology.
            </li>
            <li>
              <strong>Human review.</strong> An editor approves every item and
              the final order before it goes live.
            </li>
          </ol>
        </section>

        <section>
          <h2>Updates</h2>
          <p>
            Rankings are refreshed on a recurring schedule. When a list
            changes, the page and its structured data update together.
          </p>
        </section>

        <section>
          <h2>Disclosure</h2>
          <p>
            Some companies that appear in our rankings may be clients of our
            agency. Client status never buys a placement or a rank: every entry
            is scored on the same public rubric, and inclusion is free. If a
            listing is ever sponsored, it will be labeled.
          </p>
        </section>

        <section>
          <h2>Corrections</h2>
          <p>
            Spot something wrong or out of date? Tell us and we&apos;ll review
            it against the evidence. See each category&apos;s{" "}
            <Link href="/rankings">methodology</Link> for what we score.
          </p>
        </section>
      </div>
    </div>
  );
}
