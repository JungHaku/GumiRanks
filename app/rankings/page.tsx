import type { Metadata } from "next";
import { getCategories, groupCategories } from "@/lib/data/rankings";
import { CategoryDirectory } from "@/components/category-directory";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "All rankings",
  description:
    "Browse every top-20 ranking: agencies, marketing and SEO tools, business software, finance, careers, places, and more.",
  alternates: { canonical: "/rankings" },
};

export default async function RankingsPage() {
  const categories = await getCategories();
  const groups = groupCategories(categories);

  return (
    <div className="container">
      <div className="page-head">
        <p className="kicker">Directory</p>
        <h1>All rankings</h1>
        <p className="lede">
          {categories.length} categories, each ranked 1–20 with a published
          methodology.
        </p>
      </div>
      <div className="page-body">
        <CategoryDirectory groups={groups} />
      </div>
    </div>
  );
}
