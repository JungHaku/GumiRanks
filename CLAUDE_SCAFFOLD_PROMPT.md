# Claude Code — Scaffold Prompt

Copy everything **below the horizontal rule** into Claude Code.  
Working directory: `ranking_site/`. Keep `PROJECT_OUTLINE.md` aligned; don’t contradict it.

---

Build the ranking site in `ranking_site/` as a Vercel-ready TypeScript app. Architecture first: two surfaces, one data store.

## Architecture (non-negotiable)

```
[Public visitors] ──read──► Next.js public pages ──read──► Supabase Postgres
                                                                  ▲
[Admin] ──login──► Supabase Auth ──► /admin CMS UI ──write────────┘
```

- **Supabase** = auth + database only. It is infrastructure, not the CMS.
- **The website admin UI** is how rankings get edited. Never require opening Supabase Table Editor to change ranks, names, or blurbs in normal use.
- **Public site** is fully readable with no login.
- **Admin site** is gated: Supabase session + `admin` role (or email allowlist) required for `/admin` and all write APIs.
- Prefer **Next.js App Router** + server actions or route handlers for mutations; enforce auth server-side (not only client redirects).
- **RLS:** public `SELECT` on categories/items; `INSERT`/`UPDATE`/`DELETE` only for authenticated admins.
- **Localhost without Supabase:** public pages render from seed data so UI can be tested; admin writes document that Supabase env is required (or implement a clear “Supabase not configured” admin empty state).

### Suggested data model

- `profiles` — `id` (FK auth.users), `role` (`admin` | `user`)
- `categories` — `id`, `slug`, `name`, `group`, `methodology`, `featured` (bool), timestamps
- `ranking_items` — `id`, `category_id`, `rank` (1–20), `name`, `slug`, `blurb`, optional `score`, optional `url`, timestamps
- Unique `(category_id, rank)` and `(category_id, slug)`
- SQL migration file in repo + README steps: create project, run migration, create user, set `role = admin`, seed categories/items

### Data flow

1. Seed 25 categories × 20 placeholder items (script or SQL).
2. Public pages fetch categories/items from Supabase when env is set; else seed fallback.
3. Admin edits in `/admin` → server validates admin → writes Supabase → public pages show new order/content after save/refresh.

## Product

- General **ranking website** (“best X” lists). Not a client portal.
- North-star outcome: **AEO citation bait** (strong, crawlable “best X” pages).
- IA inspired by Vault rankings (nav → category verticals → category landing → full list), but **modern**, not dated corporate Vault, and not vibecoded AI-SaaS.

## Stack

| Piece | Choice |
|--------|--------|
| App | Next.js App Router, TypeScript, Node |
| Host | Vercel-ready |
| Auth | Supabase Auth (email/password OK for MVP) |
| DB | Supabase Postgres |
| Env | `.env.local` + `.env.example` — never commit secrets |

README must cover: install, env vars, `npm run dev`, migration, first admin user, seed, localhost.

## Routes

**Public**

| Route | Purpose |
|--------|---------|
| `/` | Home: featured ranking(s), browse by group, search |
| `/rankings` | All categories |
| `/rankings/[slug]` | Category landing: title, methodology, top ~10 preview, CTA to full list |
| `/rankings/[slug]/list` (or equivalent) | Full Top 20 |
| `/login` | Admin login (public users don’t need accounts) |
| `/logout` | Sign out |

**Admin (protected)**

| Route | Purpose |
|--------|---------|
| `/admin` | Category dashboard |
| `/admin/rankings/[slug]` | In-browser editor for that category’s Top 20 |

### Admin editor capabilities

- Edit category name + methodology (slug change optional/careful)
- Reorder items (drag-and-drop preferred, or rank inputs)
- Add / edit / delete items (`name`, `blurb`, optional `score`, optional `url`)
- Save → persist to Supabase → public list updates
- Unauthorized users: redirect to `/login` or home; APIs return 401/403

## Design

- One committed look: refined **light editorial** *or* **dark editorial** ranking site (pick one).
- Distinctive fonts — not Inter / Roboto / Arial / bare system UI stacks.
- Atmosphere without purple gradients, glass glow, pill-stat rows, emoji icon strips, or card-spam dashboards.
- Scannable ranked lists, strong category titles, clear methodology.
- Header: logo/wordmark, Rankings menu by group, search, Admin/Login.
- 2–3 tasteful motions max; responsive desktop + mobile.

## Nav groups

- Agencies & Services  
- Marketing & SEO Tools  
- Business Software  
- Finance & Ops  
- Career & Learning  
- Places & Work  
- Media & Thought Leadership  
- Alternatives  

### Categories (locked — exact names, 50)

1. Best AEO Agencies  
2. Best SEO Agencies  
3. Best Digital Marketing Agencies  
4. Best Content Marketing Agencies  
5. Best PR Agencies  
6. Best Law Firms for Startups  
7. Best Personal Injury Law Firms  
8. Best Accounting Firms for Small Business  
9. Best Business Consulting Firms  
10. Best Web Design Agencies  
11. Best AI Tools for Marketing  
12. Best AI Writing Tools  
13. Best SEO Tools  
14. Best Rank Tracking Tools  
15. Best Keyword Research Tools  
16. Best CRM Software for Small Business  
17. Best Project Management Tools  
18. Best Email Marketing Platforms  
19. Best Social Media Management Tools  
20. Best Analytics Platforms  
21. Best Website Builders  
22. Best E-commerce Platforms  
23. Best Hosting Providers for Small Business  
24. Best VPN Services  
25. Best Password Managers  
26. Best Online Banks for Small Business  
27. Best Business Credit Cards  
28. Best Accounting Software  
29. Best Payroll Software  
30. Best HR Software for Small Business  
31. Best Online Learning Platforms for Professionals  
32. Best Coding Bootcamps  
33. Best Project Management Certifications  
34. Best Cities for Startups  
35. Best Cities for Remote Workers  
36. Best Coworking Spaces (Major Cities)  
37. Best B2B SaaS Companies  
38. Best Cybersecurity Companies  
39. Best Cloud Providers  
40. Best Customer Support Software  
41. Best Chatbot Platforms for Business  
42. Best Landing Page Builders  
43. Best A/B Testing Tools  
44. Best Survey Tools  
45. Best YouTube Channels for Business Growth  
46. Best Podcasts for Entrepreneurs  
47. Best LinkedIn Influencers in Marketing  
48. Best Free Tools for SEO  
49. Best Alternatives to HubSpot  
50. Best Alternatives to Salesforce  

Each category: **20** ranked items. URL-safe slugs. Short credible methodology blurbs. Placeholder item names OK for scaffold.

## SEO (AEO-relevant)

- Unique `<title>` + meta description per category  
- Semantic headings, crawlable links to every category and list  
- Stable slugs  

## Code organization (suggested)

- `app/` — public + admin routes  
- `components/` — header, rank table, category cards, admin editor  
- `lib/supabase/` — browser + server clients  
- `lib/auth/` — session + `requireAdmin()`  
- `lib/data/` — read/write rankings (Supabase + seed fallback)  
- `supabase/migrations/` — schema + RLS  
- `scripts/seed.ts` (or SQL seed) — 25 × 20 placeholders  

## Out of scope

- Real survey methodology / employee voting  
- Multi-role CMS beyond admin  
- Real logos / external enrichment APIs  
- Adding categories beyond these 50 in this pass (schema should still make adding later easy)  
- Draft/publish workflow (instant save → live is fine for MVP)

## Done when

1. `npm install && npm run dev` works on localhost.  
2. Public site browses all 25 categories and Top 20 lists.  
3. With Supabase configured: admin can log in, edit a ranking in `/admin`, save, and see the public page update — without using the Supabase dashboard as an editor.  
4. Types check; README documents env, migration, admin bootstrap, and seed.  

Build this architecture end-to-end; leave the project ready for iteration in Cursor.
