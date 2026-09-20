import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllBooksWithContent, getArticle, getBookWithContent } from "@/lib/content";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import { ArticleLayout } from "@/components/article/ArticleLayout";
import { ArticleMeta } from "@/components/article/ArticleMeta";
import { ArticleAudio } from "@/components/article/ArticleAudio";
import { stripMarkdown } from "@/lib/markdown-text";

export async function generateStaticParams() {
  return (await getAllBooksWithContent()).flatMap((book) =>
    book.availablePasal.map((pasal) => ({ kitab: book.slug, pasal: String(pasal) })),
  );
}

export async function generateMetadata(props: PageProps<"/kitab/[kitab]/[pasal]">): Promise<Metadata> {
  const { kitab, pasal } = await props.params;
  const article = await getArticle(kitab, Number(pasal));
  if (!article) return {};
  const description = article.frontmatter.summary ?? `Eksposisi ${article.frontmatter.kitab} pasal ${article.frontmatter.pasal}.`;
  return { title: article.frontmatter.title, description, authors: [{ name: article.frontmatter.author }], openGraph: { type: "article", title: article.frontmatter.title, description, publishedTime: String(article.frontmatter.date), authors: [article.frontmatter.author], tags: article.frontmatter.tags } };
}

export default async function ArticlePage(props: PageProps<"/kitab/[kitab]/[pasal]">) {
  const { kitab, pasal } = await props.params;
  const pasalNumber = Number(pasal);
  const book = await getBookWithContent(kitab);
  const article = await getArticle(kitab, pasalNumber);
  if (!book || !article) notFound();
  const index = book.availablePasal.indexOf(pasalNumber);
  const prevPasal = index > 0 ? book.availablePasal[index - 1] : null;
  const nextPasal = index >= 0 && index < book.availablePasal.length - 1 ? book.availablePasal[index + 1] : null;

  return (
    <div>
      <div className="mx-auto max-w-[70ch] px-4 pt-8 sm:px-6"><BreadcrumbNav items={[{ label: "Kitab", href: "/" }, { label: book.name, href: `/kitab/${book.slug}` }, { label: `Pasal ${pasalNumber}` }]} /></div>
      <ArticleLayout>
        <h1 className="mb-4 font-sans text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">{article.frontmatter.title}</h1>
        <ArticleMeta frontmatter={article.frontmatter} />
        <ArticleAudio text={`${article.frontmatter.title}. ${article.frontmatter.summary ?? ""}. ${stripMarkdown(article.content)}`} />
        {article.frontmatter.summary && <p className="mt-6 text-lg leading-relaxed text-zinc-600 italic dark:text-zinc-300">{article.frontmatter.summary}</p>}
        <div className="mt-6"><MDXRemote source={article.content} /></div>
      </ArticleLayout>
      <nav className="mx-auto flex max-w-[70ch] items-center justify-between gap-4 border-t border-zinc-200 px-4 py-8 text-sm sm:px-6 dark:border-zinc-800">
        {prevPasal ? <Link href={`/kitab/${book.slug}/${prevPasal}`} className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">&larr; Pasal {prevPasal}</Link> : <span />}
        {nextPasal ? <Link href={`/kitab/${book.slug}/${nextPasal}`} className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">Pasal {nextPasal} &rarr;</Link> : <span />}
      </nav>
    </div>
  );
}
