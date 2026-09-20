import matter from "gray-matter";
import type { ArticleFrontmatter } from "@/types/content";
import { getBookTaxonomy } from "@/lib/books-taxonomy";

export interface ValidatedArticle {
  frontmatter: ArticleFrontmatter;
  content: string;
}

export function validateArticleMdx(raw: string, expectedPasal?: number): ValidatedArticle {
  const { data, content } = matter(raw);
  const frontmatter = data as Partial<ArticleFrontmatter>;
  const book = typeof frontmatter.kitab === "string" ? getBookTaxonomy(frontmatter.kitab) : undefined;
  const dateValue: unknown = frontmatter.date;
  const validDate =
    (typeof dateValue === "string" || dateValue instanceof Date) &&
    !Number.isNaN(new Date(dateValue).getTime());
  const validTags =
    Array.isArray(frontmatter.tags) && frontmatter.tags.every((tag) => typeof tag === "string");

  const errors: string[] = [];
  if (!book) errors.push("kitab tidak terdaftar");
  if (typeof frontmatter.title !== "string" || !frontmatter.title.trim()) errors.push("title wajib diisi");
  if (typeof frontmatter.pasal !== "number" || !Number.isInteger(frontmatter.pasal) || frontmatter.pasal <= 0) errors.push("pasal harus integer positif");
  if (expectedPasal !== undefined && frontmatter.pasal !== expectedPasal) errors.push(`pasal harus ${expectedPasal}`);
  if (frontmatter.kitab !== undefined && typeof frontmatter.kitab !== "string") errors.push("kitab harus string");
  if (typeof frontmatter.author !== "string" || !frontmatter.author.trim()) errors.push("author wajib diisi");
  if (!validDate) errors.push("date tidak valid");
  if (!validTags) errors.push("tags harus array string");
  if (frontmatter.summary !== undefined && typeof frontmatter.summary !== "string") errors.push("summary harus string");
  if (!content.trim()) errors.push("isi artikel kosong");

  if (errors.length) throw new Error(`Frontmatter tidak valid: ${errors.join(", ")}.`);
  return { frontmatter: frontmatter as ArticleFrontmatter, content };
}
