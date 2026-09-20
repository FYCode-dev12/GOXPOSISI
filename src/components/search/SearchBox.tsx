"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import type { SearchEntry } from "@/lib/search";

function highlightSnippet(text: string, query: string, radius = 80): string {
  if (!query.trim()) return text.slice(0, radius * 2);
  const lower = text.toLowerCase();
  const index = lower.indexOf(query.toLowerCase());
  if (index === -1) return text.slice(0, radius * 2);

  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + query.length + radius);
  const prefix = start > 0 ? "\u2026" : "";
  const suffix = end < text.length ? "\u2026" : "";
  return `${prefix}${text.slice(start, end)}${suffix}`;
}

export function SearchBox({ data }: { data: SearchEntry[] }) {
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(data, {
        keys: [
          { name: "title", weight: 0.4 },
          { name: "summary", weight: 0.25 },
          { name: "tags", weight: 0.15 },
          { name: "contentPreview", weight: 0.2 },
        ],
        threshold: 0.32,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [data]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).slice(0, 20);
  }, [fuse, query]);

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari judul, tema, atau isi artikel..."
          className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500"
          autoFocus
        />
      </div>

      {query.trim() && (
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          {results.length > 0
            ? `${results.length} hasil ditemukan`
            : "Tidak ada hasil yang cocok."}
        </p>
      )}

      <ul className="mt-4 space-y-4">
        {results.map(({ item }) => (
          <li key={item.slug}>
            <Link
              href={item.href}
              className="block rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
            >
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {item.bookName} &middot; Pasal {item.pasal}
              </span>
              <div className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                {item.title}
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {highlightSnippet(
                  item.summary || item.contentPreview,
                  query
                )}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
