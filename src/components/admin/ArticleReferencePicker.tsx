"use client";

import { useMemo } from "react";
import { BOOKS_TAXONOMY, BOOK_CHAPTERS } from "@/lib/books-taxonomy";

interface ArticleReferencePickerProps {
  selectedBook: string;
  selectedChapter: number;
  onBookChange: (book: string) => void;
  onChapterChange: (chapter: number) => void;
}

export function ArticleReferencePicker({
  selectedBook,
  selectedChapter,
  onBookChange,
  onChapterChange,
}: ArticleReferencePickerProps) {
  const book = BOOKS_TAXONOMY.find((item) => item.slug === selectedBook) ?? BOOKS_TAXONOMY[0];
  const chapterCount = BOOK_CHAPTERS[selectedBook] ?? 1;
  const chapters = useMemo(() => Array.from({ length: chapterCount }, (_, index) => index + 1), [chapterCount]);

  function selectBook(value: string) {
    onBookChange(value);
    onChapterChange(1);
  }

  return (
    <div className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Referensi artikel</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">Pilih kitab dan pasal</h2>
        </div>
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">{book.name} {selectedChapter}</span>
      </div>
      <label className="mt-4 block text-sm font-semibold text-[var(--foreground)]" htmlFor="article-book">Kitab Alkitab</label>
      <select id="article-book" value={selectedBook} onChange={(event) => selectBook(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]">
        {BOOKS_TAXONOMY.map((item) => <option key={item.slug} value={item.slug}>{item.name} · {item.testament === "PL" ? "Perjanjian Lama" : "Perjanjian Baru"}</option>)}
      </select>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--foreground)]">Pasal <span className="font-normal text-[var(--muted)]">({chapterCount} tersedia)</span></p>
        <p className="text-xs text-[var(--muted)]">Ketuk salah satu pasal</p>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10" role="listbox" aria-label={`Pasal kitab ${book.name}`}>
        {chapters.map((chapter) => <button key={chapter} type="button" role="option" aria-selected={selectedChapter === chapter} onClick={() => onChapterChange(chapter)} className={`aspect-square min-h-10 rounded-xl border text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${selectedChapter === chapter ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-md dark:text-[#071321]" : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"}`}>{chapter}</button>)}
      </div>
    </div>
  );
}
