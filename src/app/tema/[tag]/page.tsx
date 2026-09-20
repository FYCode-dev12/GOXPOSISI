import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllTags, getArticlesByTag } from "@/lib/content";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import { getBookTaxonomy } from "@/lib/books-taxonomy";

export async function generateStaticParams() {
  return (await getAllTags()).map((tag) => ({ tag }));
}

export async function generateMetadata(
  props: PageProps<"/tema/[tag]">
): Promise<Metadata> {
  const { tag } = await props.params;
  return {
    title: `Tema: ${tag}`,
    description: `Artikel eksposisi Alkitab dengan tema ${tag}.`,
  };
}

export default async function TagPage(props: PageProps<"/tema/[tag]">) {
  const { tag } = await props.params;
  const articles = await getArticlesByTag(tag);
  if (articles.length === 0) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <BreadcrumbNav
        items={[{ label: "Tema", href: "/tema" }, { label: `#${tag}` }]}
      />

      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        #{tag}
      </h1>

      <ul className="mt-8 space-y-4">
        {articles.map((article) => {
          const book = getBookTaxonomy(article.frontmatter.kitab);
          return (
            <li key={article.slug}>
              <Link
                href={`/kitab/${article.frontmatter.kitab}/${article.frontmatter.pasal}`}
                className="block rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
              >
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {book?.name ?? article.frontmatter.kitab} &middot; Pasal{" "}
                  {article.frontmatter.pasal}
                </span>
                <div className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                  {article.frontmatter.title}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
