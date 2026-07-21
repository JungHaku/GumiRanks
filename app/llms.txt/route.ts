import { getCategories, groupCategories } from "@/lib/data/rankings";
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
    "",
  ];

  for (const g of groups) {
    lines.push(`## ${g.group}`, "");
    for (const c of g.categories) {
      lines.push(`- [${c.name}](${SITE.url}/rankings/${c.slug}): full top-20 list at ${SITE.url}/rankings/${c.slug}/list`);
    }
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
