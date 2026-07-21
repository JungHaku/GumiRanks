import assert from "node:assert/strict";
import test from "node:test";
import { MAX_RANKING_ITEMS } from "./constants";
import { parseRankingCsv } from "./ranking-csv";

test("parses, trims, and sorts valid ranking CSV rows", () => {
  const result = parseRankingCsv(
    '\uFEFFrank,name,blurb,score,url\n2,Second,"Includes, a comma",88,\n1,First,"Two\nlines",99.5,https://example.com'
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(
    result.items.map(({ rank, name }) => ({ rank, name })),
    [
      { rank: 1, name: "First" },
      { rank: 2, name: "Second" },
    ]
  );
  assert.equal(result.items[0].blurb, "Two\nlines");
  assert.equal(result.items[1].blurb, "Includes, a comma");
});

test("accepts only the required columns", () => {
  const result = parseRankingCsv("rank,name\n1,First");

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.items[0], {
    rank: 1,
    name: "First",
    blurb: "",
    score: "",
    url: "",
  });
});

test("rejects duplicate and missing ranks", () => {
  const duplicate = parseRankingCsv("rank,name\n1,First\n1,Again");
  assert.equal(duplicate.ok, false);
  if (!duplicate.ok) assert.match(duplicate.errors.join(" "), /duplicated/);

  const missing = parseRankingCsv("rank,name\n1,First\n3,Third");
  assert.equal(missing.ok, false);
  if (!missing.ok) assert.match(missing.errors.join(" "), /rank 2 is missing/);
});

test("rejects unsupported columns", () => {
  const result = parseRankingCsv("rank,name,notes\n1,First,unexpected");

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.errors.join(" "), /Unsupported "notes" column/);
});

test("rejects malformed scores and URLs", () => {
  const result = parseRankingCsv(
    "rank,name,score,url\n1,First,excellent,example.com"
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  const errors = result.errors.join(" ");
  assert.match(errors, /score must be a number/);
  assert.match(errors, /URL must start with http/);
});

test(`rejects more than ${MAX_RANKING_ITEMS} rows`, () => {
  const rows = Array.from(
    { length: MAX_RANKING_ITEMS + 1 },
    (_, index) => `${index + 1},Item ${index + 1}`
  );
  const result = parseRankingCsv(`rank,name\n${rows.join("\n")}`);

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.errors.join(" "), new RegExp(`at most ${MAX_RANKING_ITEMS}`));
  }
});
