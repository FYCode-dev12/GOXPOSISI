import Link from "next/link";
import { getAllBooksWithContent } from "@/lib/content";
import { GROUP_ORDER } from "@/lib/books-taxonomy";
import type { BookWithContent } from "@/types/content";

function groupBooks(books: BookWithContent[]) {
  const groups = new Map<string, BookWithContent[]>();
  for (const book of books) {
    const list = groups.get(book.group) ?? [];
    list.push(book);
    groups.set(book.group, list);
  }
  return GROUP_ORDER.map((group) => ({
    group,
    books: (groups.get(group) ?? []).sort(
      (a, b) => a.canonicalOrder - b.canonicalOrder,
    ),
  })).filter((entry) => entry.books.length > 0);
}

export default function HomePage() {
  const books = getAllBooksWithContent();
  const pl = groupBooks(books.filter((book) => book.testament === "PL"));
  const pb = groupBooks(books.filter((book) => book.testament === "PB"));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <section className="glass-panel relative mb-12 overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--accent)]/15 blur-3xl" />
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Membaca teks dengan lebih dalam</p>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
          Eksposisi Alkitab, Pasal per Pasal
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
          Tulisan eksposisi yang menelusuri Alkitab satu pasal demi satu pasal
          &mdash; dimulai dari Kitab Roma, dan akan terus bertambah.
        </p>
      </section>

      {books.length === 0 && (
        <p className="text-zinc-500 dark:text-zinc-400">
          Belum ada artikel yang dipublikasikan.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <TestamentSection title="Perjanjian Lama" groups={pl} />
        <TestamentSection title="Perjanjian Baru" groups={pb} />
      </div>
    </div>
  );
}

function TestamentSection({
  title,
  groups,
}: {
  title: string;
  groups: { group: string; books: BookWithContent[] }[];
}) {
  if (groups.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
        {title}
      </h2>
      <div className="space-y-6">
        {groups.map(({ group, books }) => (
          <div key={group}>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              {group}
            </h3>
            <ul className="space-y-1">
              {books.map((book) => (
                <li key={book.slug}>
                  <Link
                    href={`/kitab/${book.slug}`}
                    className="font-medium text-[var(--foreground)] underline-offset-4 transition hover:text-[var(--accent)] hover:underline"
                  >
                    {book.name}
                  </Link>
                  <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500">
                    {book.availablePasal.length} pasal
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
