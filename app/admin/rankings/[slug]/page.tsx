import { notFound } from "next/navigation";
import { getCategoryBySlug, getRankingItems } from "@/lib/data/rankings";
import { RankingEditor } from "./editor";

type Props = { params: Promise<{ slug: string }> };

export default async function AdminCategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const items = await getRankingItems(category);

  return <RankingEditor category={category} initialItems={items} />;
}
