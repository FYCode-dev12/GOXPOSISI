import { getAllArticles } from "@/lib/content";
import { getBookTaxonomy } from "@/lib/books-taxonomy";
import { stripMarkdown } from "@/lib/markdown-text";

export interface SearchEntry {
  slug: string; // contoh: "roma/pasal-1"
  href: string; // contoh: "/kitab/roma/1"
  title: string;
  bookName: string;
  pasal: number;
  summary: string;
  tags: string[];
  /** Isi artikel dalam teks polos, dipotong supaya index tidak terlalu besar. */
  contentPreview: string;
}

const MAX_CONTENT_CHARS = 4000;

/** Bangun data index pencarian dari seluruh artikel yang tersedia. */
export function buildSearchIndex(): SearchEntry[] {
  return getAllArticles().map((article) => {
    const book = getBookTaxonomy(article.frontmatter.kitab);
    const plainContent = stripMarkdown(article.content).slice(
      0,
      MAX_CONTENT_CHARS
    );

    return {
      slug: article.slug,
      href: `/kitab/${article.frontmatter.kitab}/${article.frontmatter.pasal}`,
      title: article.frontmatter.title,
      bookName: book?.name ?? article.frontmatter.kitab,
      pasal: article.frontmatter.pasal,
      summary: article.frontmatter.summary ?? "",
      tags: article.frontmatter.tags ?? [],
      contentPreview: plainContent,
    };
  });
}
