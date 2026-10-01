import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/article/MarkdownArticle";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import { getAllBooksWithBackgrounds, getBookBackground } from "@/lib/content";

export async function generateStaticParams() {
  return (await getAllBooksWithBackgrounds()).map((book) => ({ kitab: book.slug }));
}

export async function generateMetadata(props: PageProps<"/latar-belakang/[kitab]">): Promise<Metadata> {
  const { kitab } = await props.params;
  const [book] = (await getAllBooksWithBackgrounds()).filter((item) => item.slug === kitab);
  const background = book ? await getBookBackground(kitab) : null;
  if (!book || !background) return { title: "Latar belakang kitab tidak ditemukan" };
  return {
    title: `Latar Belakang Kitab ${book.name}`,
    description: `Pengantar dan latar belakang Kitab ${book.name}.`,
  };
}

export default async function BookBackgroundPage(props: PageProps<"/latar-belakang/[kitab]">) {
  const { kitab } = await props.params;
  const [book] = (await getAllBooksWithBackgrounds()).filter((item) => item.slug === kitab);
  const background = book ? await getBookBackground(kitab) : null;
  if (!book || !background) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <BreadcrumbNav items={[{ label: "Beranda", href: "/" }, { label: "Kitab", href: "/kitab" }, { label: book.name, href: `/kitab/${book.slug}` }, { label: "Latar belakang" }]} />
      <header className="mt-8 border-b border-[var(--border)] pb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">{book.testament === "PL" ? "Perjanjian Lama" : "Perjanjian Baru"} · {book.group}</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">Latar Belakang Kitab {book.name}</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Pengantar kitab sebelum menelusuri eksposisi pasal demi pasal.</p>
      </header>
      <article className="prose-article py-8 text-base leading-8 text-[var(--foreground)]">
        <MarkdownArticle content={background.content} />
      </article>
      <footer className="border-t border-[var(--border)] py-6">
        <Link href={`/kitab/${book.slug}`} className="text-sm font-semibold text-[var(--accent)]">Lihat artikel Kitab {book.name} →</Link>
      </footer>
    </main>
  );
}
