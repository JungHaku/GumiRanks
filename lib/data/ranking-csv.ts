import Papa from "papaparse";
import { MAX_RANKING_ITEMS } from "./constants";

export const RANKING_CSV_HEADERS = ["rank", "name", "blurb", "score", "url"] as const;

export type ImportedRankingItem = {
  rank: number;
  name: string;
  blurb: string;
  score: string;
  url: string;
};

export type RankingCsvResult =
  | { ok: true; items: ImportedRankingItem[] }
  | { ok: false; errors: string[] };

type CsvRow = Record<string, string | undefined>;

const SUPPORTED_HEADERS = new Set<string>(RANKING_CSV_HEADERS);

export function parseRankingCsv(csv: string): RankingCsvResult {
  const input = csv.replace(/^\uFEFF/, "");
  const parsed = Papa.parse<CsvRow>(input, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  const errors = parsed.errors.map(
    (error) => `CSV row ${error.row === undefined ? "unknown" : error.row + 2}: ${error.message}`
  );
  const headers = parsed.meta.fields ?? [];

  for (const required of ["rank", "name"]) {
    if (!headers.includes(required)) errors.push(`Missing required "${required}" column.`);
  }

  for (const header of headers) {
    if (header && !SUPPORTED_HEADERS.has(header)) {
      errors.push(`Unsupported "${header}" column.`);
    }
  }

  if (parsed.data.length === 0) errors.push("The CSV does not contain any ranking items.");
  if (parsed.data.length > MAX_RANKING_ITEMS) {
    errors.push(`A ranking can contain at most ${MAX_RANKING_ITEMS} items.`);
  }
  if (errors.length > 0) return { ok: false, errors: unique(errors) };

  const ranks = new Set<number>();
  const items: ImportedRankingItem[] = [];

  parsed.data.forEach((row, index) => {
    const csvRow = index + 2;
    const rankRaw = String(row.rank ?? "").trim();
    const rank = Number(rankRaw);
    const name = String(row.name ?? "").trim();
    const blurb = String(row.blurb ?? "").trim();
    const score = String(row.score ?? "").trim();
    const url = String(row.url ?? "")
      .trim()
      .replace(/^\[(https?:\/\/[^\]]+)\]\(\1\)$/i, "$1");

    if (!Number.isInteger(rank) || rank < 1 || rank > MAX_RANKING_ITEMS) {
      errors.push(
        `CSV row ${csvRow}: rank must be a whole number from 1 to ${MAX_RANKING_ITEMS}.`
      );
    } else if (ranks.has(rank)) {
      errors.push(`CSV row ${csvRow}: rank ${rank} is duplicated.`);
    } else {
      ranks.add(rank);
    }

    if (!name) errors.push(`CSV row ${csvRow}: name is required.`);

    if (score) {
      const parsedScore = Number(score);
      if (!Number.isFinite(parsedScore)) {
        errors.push(`CSV row ${csvRow}: score must be a number or blank.`);
      } else if (Math.abs(parsedScore) > 9999.9) {
        errors.push(`CSV row ${csvRow}: score must be between -9999.9 and 9999.9.`);
      }
    }

    if (url && !/^https?:\/\//i.test(url)) {
      errors.push(`CSV row ${csvRow}: URL must start with http:// or https://.`);
    }

    items.push({ rank, name, blurb, score, url });
  });

  if (errors.length === 0) {
    const sortedRanks = [...ranks].sort((a, b) => a - b);
    for (let index = 0; index < sortedRanks.length; index++) {
      const expected = index + 1;
      if (sortedRanks[index] !== expected) {
        errors.push(`Ranks must be contiguous from 1 to ${items.length}; rank ${expected} is missing.`);
        break;
      }
    }
  }

  if (errors.length > 0) return { ok: false, errors: unique(errors) };

  return {
    ok: true,
    items: items.sort((a, b) => a.rank - b.rank),
  };
}

export function rankingCsvTemplate(): string {
  return `${RANKING_CSV_HEADERS.join(",")}\n1,Example item,Why this item ranks first,99.5,https://example.com\n`;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
