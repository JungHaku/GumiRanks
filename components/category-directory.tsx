"use client";

// Full category directory with client-side filtering. Deliberately NOT built
// on useSearchParams: that would blank the list during prerender and hide it
// from crawlers. The full list is in the initial HTML; ?q= is read on mount.
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Category } from "@/lib/data/types";

type Group = { group: string; categories: Category[] };

export function CategoryDirectory({ groups }: { groups: Group[] }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? groups
        .map((g) => ({
          group: g.group,
          categories: g.categories.filter((c) =>
            c.name.toLowerCase().includes(needle)
          ),
        }))
        .filter((g) => g.categories.length > 0)
    : groups;

  return (
    <div>
      <div className="filter-box">
        <input
          type="search"
          placeholder="Filter categories…"
          aria-label="Filter categories"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {filtered.length === 0 ? (
        <p className="empty-note">No categories match “{query}”.</p>
      ) : (
        filtered.map((g) => (
          <section key={g.group} className="group-section">
            <h2 className="section-title">{g.group}</h2>
            <div className="group-grid">
              {g.categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/rankings/${c.slug}`}
                  className="cat-link"
                >
                  <span>{c.name}</span>
                  <span className="arrow">Top 20 →</span>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
