# Gemini Prompt — Generate Ranking CSVs

Copy everything **below the horizontal rule** into Gemini (prefer **Gemini 2.5 Pro** or Flash **with Google Search / grounding on**).

Ask Gemini to export **one CSV file per category** (or one clearly labeled fenced CSV block per category if the UI can’t attach files).

---

You are a research analyst building **original editorial ranking drafts** for a ranking website.

## Mission

Produce **25 CSV files**, one per category below. Each file is a **Top 20** ranking draft I will manually edit before publishing.

Do **not** invent fake companies. Prefer real, currently operating organizations with real websites. Use web research / Google Search grounding when available. If evidence is thin for a category, still deliver 20 rows but mark weaker entries with a conservative score and a cautious blurb.

## Hard output rules

1. Create **exactly one CSV per category** listed below.
2. Filename must be the category slug + `.csv` (example: `best-aeo-agencies.csv`).
3. CSV header row must be **exactly**:

```csv
rank,name,blurb,score,url
```

4. Exactly **20 data rows** per file (ranks `1` through `20`, contiguous, no duplicates).
5. Field rules:
   - `rank`: integer 1–20
   - `name`: real organization / product / place name
   - `blurb`: 1–2 original sentences; factual; no copied review text; no unsupported insults
   - `score`: number from about 70.0–99.5, descending roughly with rank (one decimal ok)
   - `url`: official homepage starting with `https://` (preferred) or `http://`
6. Quote fields that contain commas.
7. UTF-8, no BOM needed.
8. Do **not** add extra columns (`category`, `sources`, notes, etc.). Keep research notes outside the CSV if you must show them.
9. Do **not** copy another publisher’s exact order or proprietary scores.
10. After all CSVs, add a short **Sources & confidence** appendix listing 3–8 source types used per category (not pasted into the CSV).

## Ranking method (apply consistently)

For each category, build an **original consensus-style draft**:

1. Discover candidates from multiple reputable public sources (directories, official sites, independent reviews, public datasets, major publications).
2. Prefer candidates with:
   - clear relevance to the category
   - an official website
   - some independent corroboration when available
3. Score roughly on:
   - relevance / specialization fit (highest weight)
   - evidence of quality (case studies, reputation, product depth)
   - transparency / clarity of offering
   - practical fit for the category’s audience
4. Sort by your score → assign ranks 1–20.
5. Write an original blurb from verified facts only.

If two candidates are close, prefer the one with stronger independent corroboration and a clearer official site.

## Categories (exact names + exact output filenames)

1. Best AEO Agencies → `best-aeo-agencies.csv`
2. Best SEO Agencies → `best-seo-agencies.csv`
3. Best Digital Marketing Agencies → `best-digital-marketing-agencies.csv`
4. Best Content Marketing Agencies → `best-content-marketing-agencies.csv`
5. Best PR Agencies → `best-pr-agencies.csv`
6. Best Web Design Agencies → `best-web-design-agencies.csv`
7. Best AI Tools for Marketing → `best-ai-tools-for-marketing.csv`
8. Best AI Writing Tools → `best-ai-writing-tools.csv`
9. Best SEO Tools → `best-seo-tools.csv`
10. Best Rank Tracking Tools → `best-rank-tracking-tools.csv`
11. Best Keyword Research Tools → `best-keyword-research-tools.csv`
12. Best Email Marketing Platforms → `best-email-marketing-platforms.csv`
13. Best Free Tools for SEO → `best-free-tools-for-seo.csv`
14. Best CRM Software for Small Business → `best-crm-software-for-small-business.csv`
15. Best Project Management Tools → `best-project-management-tools.csv`
16. Best Website Builders → `best-website-builders.csv`
17. Best Customer Support Software → `best-customer-support-software.csv`
18. Best Chatbot Platforms for Business → `best-chatbot-platforms-for-business.csv`
19. Best Accounting Software → `best-accounting-software.csv`
20. Best Payroll Software → `best-payroll-software.csv`
21. Best Online Learning Platforms for Professionals → `best-online-learning-platforms-for-professionals.csv`
22. Best Cities for Startups → `best-cities-for-startups.csv`
23. Best Podcasts for Entrepreneurs → `best-podcasts-for-entrepreneurs.csv`
24. Best Alternatives to HubSpot → `best-alternatives-to-hubspot.csv`
25. Best Alternatives to Salesforce → `best-alternatives-to-salesforce.csv`

## Category-specific notes

- **AEO Agencies:** prioritize firms that explicitly offer AEO / GEO / AI-search visibility work, not generic SEO-only shops unless they clearly do AI-answer optimization.
- **Free Tools for SEO:** free tier must be genuinely useful; include the product homepage.
- **Cities for Startups:** `url` can be the city’s official site or a major economic-development page.
- **Podcasts:** `url` should be the official show page (site, Spotify, Apple, or YouTube hub).
- **Alternatives to HubSpot / Salesforce:** include real competing products, not parody names.

## Example row shape

```csv
rank,name,blurb,score,url
1,Example Co,"Focused AEO programs with clear reporting and strong mid-market case studies.",96.5,https://example.com
```

## Delivery format

For each category, output:

### `{category name}`
Filename: `{slug}.csv`

```csv
rank,name,blurb,score,url
1,...,...,...,https://...
...
20,...,...,...,https://...
```

Then continue to the next category until all 25 are done.

Finally output:

## Sources & confidence
For each category: 3–8 source types/domains consulted + one-line confidence note (`high` / `medium` / `low`).

## Quality bar before you finish

Self-check every CSV:
- [ ] Exactly 20 ranks, 1–20 contiguous
- [ ] Header exact match
- [ ] Every URL starts with http:// or https://
- [ ] No duplicate names inside a category
- [ ] Blurbs are original and non-defamatory
- [ ] Names look like real entities you can justify from research

If a category is hard, say so in the confidence appendix, but still deliver the CSV draft.

Begin with **Best AEO Agencies**, then proceed through the full list in order.
