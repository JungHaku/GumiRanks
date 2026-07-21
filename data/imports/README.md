# Ranking CSV imports

Cleaned ranking drafts for the current 11 categories.

| File | Category |
|------|----------|
| `best-startup-law-firms.csv` | Best Startup Law Firms |
| `best-aeo-agencies.csv` | Best AEO Agencies |
| `best-seo-agencies.csv` | Best SEO Agencies |
| `best-digital-marketing-agencies.csv` | Best Digital Marketing Agencies |
| `best-content-marketing-agencies.csv` | Best Content Marketing Agencies |
| `best-pr-agencies.csv` | Best PR Agencies |
| `best-web-design-agencies.csv` | Best Web Design Agencies |
| `best-ai-tools-for-marketing.csv` | Best AI Tools for Marketing |
| `best-ai-writing-tools.csv` | Best AI Writing Tools |
| `best-seo-tools.csv` | Best SEO Tools |
| `best-rank-tracking-tools.csv` | Best Rank Tracking Tools |

Format: `rank,name,score,url,blurb` (column order flexible).

After editing CSVs, regenerate the localhost seed module:

```bash
npm run build:imports
```
