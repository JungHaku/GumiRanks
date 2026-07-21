-- 0002_top20.sql — reduce ranking size from Top 100 to Top 20.
-- Safe to run if 0001 was already applied with the old 1–100 check.

alter table public.ranking_items
  drop constraint if exists ranking_items_rank_check;

alter table public.ranking_items
  add constraint ranking_items_rank_check check (rank between 1 and 20);

-- Drop any leftover items beyond Top 20 (e.g. from the old seed).
delete from public.ranking_items where rank > 20;
