import Link from "next/link";
import type { Metadata } from "next";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import { getAllBooksWithBackgrounds } from "@/lib/content";

export const metadata: Metadata = {
  title: "Latar Belakang Kitab",
  description: "Pengantar dan konteks kitab-kitab Alkitab.",
};

export default async function BookBackgroundIndexPage() {
  const books = await getAllBooksWithBackgrounds();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <BreadcrumbNav items={[{ label: "Beranda", href: "/" }, { label: "Latar belakang kitab" }]} />
      <header className="mt-8 border-b border-[var(--border)] pb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Panduan Alkitab</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">Latar Belakang Kitab</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">Pengantar dan konteks untuk membantu memahami eksposisi setiap kitab.</p>
      </header>
      {books.length ? (
        <div className="mt-6 divide-y divide-[var(--border)]">
          {books.map((book) => (
            <Link key={book.slug} href={`/latar-belakang/${book.slug}`} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="font-semibold text-[var(--foreground)]">{book.name}</h2><p className="mt-1 text-xs text-[var(--muted)]">{book.testament === "PL" ? "Perjanjian Lama" : "Perjanjian Baru"} · {book.group}</p></div>
              <span className="text-sm font-semibold text-[var(--accent)]">Baca latar belakang →</span>
            </Link>
          ))}
        </div>
      ) : <p className="mt-8 border-t border-[var(--border)] py-8 text-sm text-[var(--muted)]">Belum ada latar belakang kitab yang diterbitkan.</p>}
    </main>
  );
}
