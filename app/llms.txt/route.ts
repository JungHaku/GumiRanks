import {
  getCategories,
  getRankingItems,
  groupCategories,
} from "@/lib/data/rankings";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export async function GET() {
  const categories = await getCategories();
  const groups = groupCategories(categories);

  const lines: string[] = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    "Every ranking lists up to 20 entries in order, with a published methodology.",
    `Editorial process and disclosure: ${SITE.url}/about`,
    "",
  ];

  for (const g of groups) {
    lines.push(`## ${g.group}`, "");
    for (const c of g.categories) {
      lines.push(
        `### [${c.name}](${SITE.url}/rankings/${c.slug})`,
        "",
        c.methodology,
        ""
      );
      const top = (await getRankingItems(c)).slice(0, 5);
      for (const item of top) {
        lines.push(`${item.rank}. ${item.name}${item.blurb ? ` — ${item.blurb}` : ""}`);
      }
      lines.push(
        "",
        `Full top-20 list: ${SITE.url}/rankings/${c.slug}/list`,
        ""
      );
    }
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
