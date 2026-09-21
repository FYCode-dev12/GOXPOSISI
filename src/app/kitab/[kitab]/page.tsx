import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllBooksWithContent, getArticle, getBookWithContent } from "@/lib/content";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";

export async function generateStaticParams() {
  return (await getAllBooksWithContent()).map((book) => ({ kitab: book.slug }));
}

export async function generateMetadata(props: PageProps<"/kitab/[kitab]">): Promise<Metadata> {
  const { kitab } = await props.params;
  const book = await getBookWithContent(kitab);
  if (!book) return {};
  return { title: book.name, description: `Latar belakang dan daftar eksposisi Kitab ${book.name}.` };
}

export default async function BookPage(props: PageProps<"/kitab/[kitab]">) {
  const { kitab } = await props.params;
  const book = await getBookWithContent(kitab);
  if (!book || book.availablePasal.length === 0) notFound();

  const articles = await Promise.all(book.availablePasal.map(async (pasal) => ({ pasal, article: await getArticle(book.slug, pasal) })));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <BreadcrumbNav items={[{ label: "Kitab", href: "/" }, { label: book.name }]} />
      <header className="mt-6 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">{book.testament === "PL" ? "Perjanjian Lama" : "Perjanjian Baru"}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">Kitab {book.name}</h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">{book.meta.totalPasal} pasal total · {book.availablePasal.length} pasal sudah ditulis</p>
      </header>

      <section className="glass-panel mt-8 rounded-3xl p-6 sm:p-8" aria-labelledby="background-title">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Sebelum pembahasan</p>
        <h2 id="background-title" className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">Latar belakang Kitab {book.name}</h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)]">{book.meta.background ?? `Bagian ini memberikan konteks awal untuk membaca Kitab ${book.name}. Latar belakang yang lebih lengkap akan ditambahkan.`}</p>
      </section>

      <section className="mt-10" aria-labelledby="chapters-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Pembahasan</p><h2 id="chapters-title" className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Eksposisi per pasal</h2></div>
          <span className="text-sm text-[var(--muted)]">{book.availablePasal.length} artikel tersedia</span>
        </div>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {articles.map(({ pasal, article }) => (
            <li key={pasal}><Link href={`/kitab/${book.slug}/${pasal}`} className="glass-panel group block rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-[var(--accent)]"><span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Pasal {pasal}</span><div className="mt-2 text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)]">{article?.frontmatter.title ?? `${book.name} ${pasal}`}</div><p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{article?.frontmatter.summary ?? "Buka pembahasan eksposisi pasal ini."}</p><span className="mt-4 inline-block text-sm font-semibold text-[var(--accent)]">Baca pembahasan →</span></Link></li>
          ))}
        </ul>
      </section>
    </main>
  );
}