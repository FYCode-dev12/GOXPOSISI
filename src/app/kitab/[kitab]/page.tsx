import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllBooksWithContent,
  getArticle,
  getBookWithContent,
} from "@/lib/content";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";

export function generateStaticParams() {
  return getAllBooksWithContent().map((book) => ({ kitab: book.slug }));
}

export async function generateMetadata(
  props: PageProps<"/kitab/[kitab]">
): Promise<Metadata> {
  const { kitab } = await props.params;
  const book = getBookWithContent(kitab);
  if (!book) return {};

  return {
    title: book.name,
    description: `Daftar eksposisi pasal Kitab ${book.name}.`,
  };
}

export default async function BookPage(props: PageProps<"/kitab/[kitab]">) {
  const { kitab } = await props.params;
  const book = getBookWithContent(kitab);
  if (!book || book.availablePasal.length === 0) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <BreadcrumbNav
        items={[
          { label: "Kitab", href: "/" },
          { label: book.name },
        ]}
      />

      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {book.name}
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {book.testament === "PL" ? "Perjanjian Lama" : "Perjanjian Baru"}
        {" \u00b7 "}
        {book.meta.totalPasal} pasal total, {book.availablePasal.length}{" "}
        sudah ditulis
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {book.availablePasal.map((pasal) => {
          const article = getArticle(book.slug, pasal);
          return (
            <li key={pasal}>
              <Link
                href={`/kitab/${book.slug}/${pasal}`}
                className="block rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
              >
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Pasal {pasal}
                </span>
                <div className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                  {article?.frontmatter.title ?? `${book.name} ${pasal}`}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
