"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <form
      className="header-search"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const q = query.trim();
        router.push(q ? `/rankings?q=${encodeURIComponent(q)}` : "/rankings");
      }}
    >
      <input
        type="search"
        placeholder="Search rankings…"
        aria-label="Search rankings"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
    </form>
  );
}
