# Ranking Site — Project Outline

**Date:** July 15, 2026  
**Location:** `ranking_site/`  
**Status:** Scaffolded — app builds and runs; Supabase project + Vercel deploy pending

---

## Purpose

Build a **general ranking website** — the product focus is rankings themselves (lists, comparisons, standings across various topics/categories). Helping our clients is a benefit of the site, not the framing: it is not a client portal or client-centric tool. The **ultimate goal** is to boost **AEO (Answer Engine Optimization)** by creating ranking properties that earn visibility and citations in answer engines.

---

## Tech stack (confirmed)

| Layer | Choice | Why |
|--------|--------|-----|
| Language / runtime | **TypeScript + Node.js** (Next.js App Router preferred) | Typed, maintainable, fits Vercel |
| Hosting | **Vercel** | Simple deploys from GitHub |
| Source control | **GitHub** | Repo + CI-friendly workflow |
| Auth | **Supabase Auth** | Admin login only (for MVP) |
| Data | **Supabase DB** (via the app, not the dashboard) | Persist rankings; edit through site admin UI |

---

## Auth & admin editing (locked)

- **Public site:** anyone can browse rankings (no login required).
- **Admin login:** Supabase Auth for admins/editors only.
- **In-site ranking editor:** after login, admins can edit rankings **on the website** (reorder, rename items, edit blurbs/scores, add/remove items, edit category copy).
- **No day-to-day Supabase dashboard editing.** Supabase still stores auth + data under the hood; the website is the CMS. Admins should never need to open Supabase tables to update a list.

### Admin capabilities (MVP)

- Log in / log out
- Pick a category
- Edit Top 20 list: reorder, create/update/delete items, CSV import
- Edit category title, short methodology blurb (slug is immutable)
- Changes publish immediately on Save

---

## Product direction

- **Primary:** ranking site with Vault-like IA (category browse → category page → full Top 20), modern design (not dated Vault, not vibecoded).
- **Secondary:** AEO citation bait via strong “best X” category pages.
- **v1 scope locked:** **11 categories**, each a **Top 20** (expand later).

---

## Categories (v1 locked — 11)

See [`lib/data/categories.ts`](lib/data/categories.ts). Draft CSVs live in `data/imports/`. Each category targets **20 ranked items**.

---

## Open questions

1. ~~**Auth shape?**~~ **Resolved:** email/password for MVP (Supabase Auth).
2. **How many admins?** Schema supports many (`profiles.role`); bootstrap is a single owner account for now. Inviteable editors can come later without schema changes.
3. ~~**Draft vs publish?**~~ **Resolved:** instant save → live (admin save revalidates the public pages).
4. ~~**Brand name**~~ **Resolved:** **GumiRanks** (`lib/site.ts`).

---

## Suggested repo / deploy shape

- App in `ranking_site/`, Vercel project, Supabase project.
- `.env.example` for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only keys as needed.
- Role check: only users marked admin (e.g. `profiles.role = 'admin'` or allowlist) can access `/admin`.

---

## Next steps

1. ~~Scaffold Next.js + public ranking pages + placeholder data.~~ ✅ Done (July 15, 2026) — see `README.md`.
2. ~~Add Supabase schema + admin UI to edit rankings in-browser.~~ ✅ Done — `supabase/migrations/0001_init.sql` + `/admin` editor (needs a Supabase project to go live).
3. Create Supabase project, run migration, bootstrap admin, `npm run seed`, verify admin edit → public update on localhost.
4. GitHub → Vercel deploy. Keep `NEXT_PUBLIC_SITE_INDEXABLE=false` (noindex) until lists have real content.
5. Brand is **GumiRanks** (`lib/site.ts`).

### AEO features shipped in the scaffold

- `ItemList` JSON-LD on every category landing + full-list page; `WebSite` JSON-LD on home.
- `sitemap.xml` + `llms.txt` generated from live data; unique titles/descriptions per category.
- Stable slugs (immutable in admin); noindex-by-default guard against indexing placeholder content.

---

*Living kickoff note. Update as decisions land.*
