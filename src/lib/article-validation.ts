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
  else if (frontmatter.title.trim().length > 200) errors.push("title maksimal 200 karakter");
  if (typeof frontmatter.pasal !== "number" || !Number.isInteger(frontmatter.pasal) || frontmatter.pasal <= 0) errors.push("pasal harus integer positif");
  if (expectedPasal !== undefined && frontmatter.pasal !== expectedPasal) errors.push(`pasal harus ${expectedPasal}`);
  if (frontmatter.kitab !== undefined && typeof frontmatter.kitab !== "string") errors.push("kitab harus string");
  if (typeof frontmatter.author !== "string" || !frontmatter.author.trim()) errors.push("author wajib diisi");
  else if (frontmatter.author.trim().length > 120) errors.push("author maksimal 120 karakter");
  if (!validDate) errors.push("date tidak valid");
  if (!validTags) errors.push("tags harus array string");
  else if (frontmatter.tags && (frontmatter.tags.length > 20 || frontmatter.tags.some((tag) => tag.length > 80))) errors.push("tags terlalu banyak atau terlalu panjang");
  if (frontmatter.summary !== undefined && typeof frontmatter.summary !== "string") errors.push("summary harus string");
  else if (typeof frontmatter.summary === "string" && frontmatter.summary.length > 500) errors.push("summary maksimal 500 karakter");
  if (!content.trim()) errors.push("isi artikel kosong");
  else if (content.length > 500_000) errors.push("isi artikel maksimal 500 KB");
  if (raw.length > 600_000) errors.push("file artikel terlalu besar");
  if (content.includes("<script") || /on\w+\s*=\s*["']/i.test(content)) errors.push("HTML/script tidak diizinkan dalam Markdown");

  if (errors.length) throw new Error(`Frontmatter tidak valid: ${errors.join(", ")}.`);
  return { frontmatter: frontmatter as ArticleFrontmatter, content };
}
