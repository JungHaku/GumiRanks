# GumiRanks — ranking site

Editorial top-20 rankings (“best X” lists) built for AEO: strong, crawlable
category pages with `ItemList` JSON-LD, a sitemap, and `llms.txt`.
Brand config lives in [`lib/site.ts`](lib/site.ts).

## Architecture

```
[Public visitors] ──read──► Next.js public pages ──read──► Supabase Postgres
                                                                  ▲
[Admin] ──login──► Supabase Auth ──► /admin CMS UI ──write────────┘
```

- **Supabase is infrastructure, not the CMS.** Rankings are edited at `/admin`
  on the website. Day-to-day, nobody opens the Supabase Table Editor.
- **Public site** needs no login and — with no Supabase env at all — renders
  from bundled seed data, so the UI is fully testable on localhost.
- **Admin** requires a Supabase session **and** `profiles.role = 'admin'`,
  enforced server-side (`requireAdmin()`) and again by Postgres RLS.
- Public pages are ISR (revalidate 300s); admin saves call `revalidatePath`
  so published changes appear immediately.

## Stack

Next.js (App Router) · TypeScript · Supabase (Auth + Postgres) · Vercel-ready.
No CSS framework — hand-rolled light-editorial design (Fraunces + Archivo).

## Quickstart (no Supabase needed)

```bash
npm install
npm run dev
```

Open http://localhost:3000 — all 10 categories and Top-20 lists render from
seed data (Gemini draft CSVs when present). `/admin` and `/login` will tell you
Supabase isn’t configured.

## Full setup (Supabase)

1. **Create a Supabase project** at https://supabase.com.
2. **Run the migrations:** paste
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   (and [`0002_top20.sql`](supabase/migrations/0002_top20.sql) if upgrading
   from an older Top-100 schema) into the SQL editor.
3. **Env vars:** copy `.env.example` to `.env.local` and fill in
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (Settings → API), and `SUPABASE_SERVICE_ROLE_KEY` (needed only for the
   seed script). Never commit `.env.local`.
4. **Seed data:**

   ```bash
   npm run seed
   ```

   Inserts the 10 locked categories × 20 ranking items.
   ⚠️ Re-running **replaces every category’s items** with seed/import data.
5. **First admin user** (one-time bootstrap — the only time you touch the
   Supabase dashboard):
   - Dashboard → Authentication → Users → **Add user** (email + password,
     confirm email).
   - SQL editor:

     ```sql
     update public.profiles set role = 'admin'
     where id = (select id from auth.users where email = 'you@example.com');
     ```

6. `npm run dev` → http://localhost:3000/login → sign in → edit any ranking at
   `/admin` → Save & publish → the public page reflects it.

## Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | public | Featured rankings, browse by group |
| `/rankings` | public | All 10 categories (filterable; header search lands here) |
| `/rankings/[slug]` | public | Category landing: methodology + top 10 |
| `/rankings/[slug]/list` | public | Full Top 20 |
| `/login` | public | Admin sign-in (sign-out is a POST action in the admin bar) |
| `/admin` | admin | Category dashboard |
| `/admin/rankings/[slug]` | admin | Top-20 editor: CSV import, reorder, add/edit/delete, category copy |

## SEO / AEO

- Unique `<title>` + meta description per category; semantic headings;
  crawlable links to every category and list page.
- `ItemList` JSON-LD on every category landing and full-list page;
  `WebSite` JSON-LD on the home page.
- `sitemap.xml` and `llms.txt` are generated from live data.
- **Stable slugs:** category slugs are immutable in the admin UI on purpose.
- **Noindex by default:** while `NEXT_PUBLIC_SITE_INDEXABLE` ≠ `true`, every
  page serves `noindex` and robots.txt disallows all — so placeholder lists
  never reach an index. Flip it once real content is in.

## Deploy (Vercel)

1. Push to GitHub, import the repo in Vercel (root: `ranking_site/`).
2. Set the env vars from `.env.example` (service role key is **not** needed
   at runtime — only locally for seeding).
3. Set `NEXT_PUBLIC_SITE_URL` to the production URL. Keep
   `NEXT_PUBLIC_SITE_INDEXABLE=false` until content is real.

## Project layout

```
app/                    public + admin routes (App Router)
components/             header, rank table, category directory, JSON-LD
lib/supabase/           public (cookie-free) + server (cookie-bound) clients
lib/auth/               requireAdmin() session gate
lib/data/               category defs, seed generator, CSV import, types
supabase/migrations/    schema + RLS + replace_ranking_items RPC
scripts/seed.ts         25×20 placeholder seed (service role)
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (also type-checks) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | CSV parser unit tests |
| `npm run seed` | Seed/reset categories + items in Supabase |
