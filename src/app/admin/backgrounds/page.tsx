"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BOOKS_TAXONOMY } from "@/lib/books-taxonomy";

type Background = { kitab: string; content: string; updated_at?: string };

function markdownText(content: string) {
  return content.replace(/[#>*_`\n]/g, " ").replace(/\s+/g, " ").trim();
}

export default function AdminBackgroundsPage() {
  const [items, setItems] = useState<Background[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [testament, setTestament] = useState<"all" | "PL" | "PB">("all");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/backgrounds", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Gagal memuat latar belakang.");
      setItems(result.backgrounds ?? []);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal memuat latar belakang.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  async function remove(item: Background) {
    const name = BOOKS_TAXONOMY.find((book) => book.slug === item.kitab)?.name ?? item.kitab;
    if (!window.confirm(`Hapus latar belakang Kitab ${name}?`)) return;
    try {
      const response = await fetch("/api/admin/backgrounds", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kitab: item.kitab }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Gagal menghapus latar belakang.");
      setMessage(`Latar belakang ${name} dihapus.`);
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menghapus latar belakang.");
    }
  }

  const bySlug = useMemo(() => new Map(items.map((item) => [item.kitab, item])), [items]);
  const filteredBooks = BOOKS_TAXONOMY.filter((book) => {
    const matchesQuery = `${book.name} ${book.slug}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (testament === "all" || book.testament === testament);
  });
  const availableCount = BOOKS_TAXONOMY.filter((book) => bySlug.has(book.slug)).length;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">GOXPOSISI Admin · CMS</p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">Latar belakang kitab</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Kelola pengantar kitab yang tampil di halaman publik.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void refresh()} className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]">Muat ulang</button>
          <Link href="/admin/upload?mode=background" className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white dark:text-[#071321]">Tambah latar belakang</Link>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:max-w-lg" aria-label="Ringkasan latar belakang">
        <div className="border-l-2 border-[var(--accent)] pl-4"><p className="text-xs font-semibold uppercase text-[var(--muted)]">Sudah tersedia</p><p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{availableCount}<span className="ml-1 text-sm font-normal text-[var(--muted)]">/ {BOOKS_TAXONOMY.length} kitab</span></p></div>
        <div className="border-l-2 border-[var(--border)] pl-4"><p className="text-xs font-semibold uppercase text-[var(--muted)]">Belum dibuat</p><p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{BOOKS_TAXONOMY.length - availableCount}<span className="ml-1 text-sm font-normal text-[var(--muted)]">kitab</span></p></div>
      </section>

      {message && <p role="status" className="mt-5 rounded-lg border border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)]">{message}</p>}

      <div className="mt-7 flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="sr-only" htmlFor="background-search">Cari kitab</label>
        <input id="background-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari kitab..." className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)] sm:max-w-xs" />
        <div className="flex gap-1 rounded-lg border border-[var(--border)] p-1" aria-label="Filter perjanjian">
          {([{ value: "all", label: "Semua" }, { value: "PL", label: "PL" }, { value: "PB", label: "PB" }] as const).map((option) => <button key={option.value} type="button" aria-pressed={testament === option.value} onClick={() => setTestament(option.value)} className={`rounded-md px-3 py-1.5 text-sm font-semibold ${testament === option.value ? "bg-[var(--primary)] text-white dark:text-[#071321]" : "text-[var(--muted)]"}`}>{option.label}</button>)}
        </div>
      </div>

      {loading ? <p className="py-12 text-center text-sm text-[var(--muted)]">Memuat data...</p> : (
        <div className="mt-2 divide-y divide-[var(--border)]">
          {filteredBooks.map((book) => {
            const item = bySlug.get(book.slug);
            return <article key={book.slug} className="grid gap-3 py-4 sm:grid-cols-[minmax(12rem,0.8fr)_minmax(0,2fr)_auto] sm:items-center sm:gap-5">
              <div className="min-w-0"><h2 className="font-semibold text-[var(--foreground)]">{book.name}</h2><p className="mt-0.5 text-xs text-[var(--muted)]">{book.testament === "PL" ? "Perjanjian Lama" : "Perjanjian Baru"} · {book.group}</p></div>
              <p className="line-clamp-2 text-sm leading-6 text-[var(--muted)]">{item ? markdownText(item.content).slice(0, 220) : "Belum ada latar belakang"}</p>
              <div className="flex flex-wrap items-center gap-2">
                {item ? <><Link href={`/latar-belakang/${book.slug}`} target="_blank" className="rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)]">Lihat</Link><Link href={`/admin/upload?mode=background&kitab=${book.slug}`} className="rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)]">Edit</Link><button type="button" onClick={() => void remove(item)} className="rounded-md border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-600">Hapus</button></> : <Link href={`/admin/upload?mode=background&kitab=${book.slug}`} className="rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)]">Buat</Link>}
              </div>
            </article>;
          })}
          {filteredBooks.length === 0 && <p className="py-10 text-center text-sm text-[var(--muted)]">Tidak ada kitab yang cocok.</p>}
        </div>
      )}
    </main>
  );
}
