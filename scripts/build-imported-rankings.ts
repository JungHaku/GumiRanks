import fs from "node:fs";
import path from "node:path";
import { parseRankingCsv } from "../lib/data/ranking-csv";
import { slugify } from "../lib/data/slug";

const dir = path.join(process.cwd(), "data/imports");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".csv")).sort();
const out: Record<
  string,
  {
    id: string;
    rank: number;
    name: string;
    slug: string;
    blurb: string;
    score: number | null;
    url: string | null;
  }[]
> = {};

for (const f of files) {
  const slug = f.replace(/\.csv$/, "");
  const result = parseRankingCsv(fs.readFileSync(path.join(dir, f), "utf8"));
  if (!result.ok) {
    console.error("FAIL", f, result.errors);
    process.exit(1);
  }
  out[slug] = result.items.map((item) => ({
    id: `import-${slug}-${item.rank}`,
    rank: item.rank,
    name: item.name,
    slug: slugify(item.name),
    blurb: item.blurb,
    score: item.score === "" ? null : Number(item.score),
    url: item.url || null,
  }));
  console.log("OK", f, result.items.length);
}

const body =
  `import type { RankingItem } from "./types";\n\n` +
  `/** Gemini draft rankings imported from data/imports/*.csv */\n` +
  `export const importedRankings: Record<string, RankingItem[]> = ${JSON.stringify(
    out,
    null,
    2
  )} as Record<string, RankingItem[]>;\n`;

fs.writeFileSync(path.join(process.cwd(), "lib/data/imported-rankings.ts"), body);
console.log("wrote lib/data/imported-rankings.ts");
