import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type {
  Article,
  ArticleFrontmatter,
  BookMeta,
  BookWithContent,
} from "@/types/content";
import { getBookTaxonomy } from "@/lib/books-taxonomy";

const CONTENT_DIR = path.join(process.cwd(), "content");

function isSafeBookSlug(bookSlug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(bookSlug) && Boolean(getBookTaxonomy(bookSlug));
}

function isSafePasal(pasal: number): boolean {
  return Number.isInteger(pasal) && pasal > 0;
}

function safeReadDir(dir: string): string[] {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

/** Slug semua kitab yang sudah punya folder + meta.json di /content */
export function getAvailableBookSlugs(): string[] {
  return safeReadDir(CONTENT_DIR).filter((entry) => {
    if (!isSafeBookSlug(entry)) return false;
    const bookDir = path.join(CONTENT_DIR, entry);
    return (
      fs.statSync(bookDir).isDirectory() &&
      fs.existsSync(path.join(bookDir, "meta.json"))
    );
  });
}

export function getBookMeta(bookSlug: string): BookMeta | null {
  if (!isSafeBookSlug(bookSlug)) return null;
  const metaPath = path.join(CONTENT_DIR, bookSlug, "meta.json");
  if (!fs.existsSync(metaPath)) return null;

  const raw = JSON.parse(fs.readFileSync(metaPath, "utf-8")) as Partial<BookMeta>;
  const taxonomy = getBookTaxonomy(bookSlug);
  if (
    !taxonomy ||
    raw.name !== taxonomy.name ||
    raw.testament !== taxonomy.testament ||
    typeof raw.order !== "number" ||
    !Number.isInteger(raw.order) ||
    typeof raw.totalPasal !== "number" ||
    !Number.isInteger(raw.totalPasal) ||
    raw.totalPasal <= 0
  ) {
    throw new Error(`Metadata kitab tidak valid: content/${bookSlug}/meta.json`);
  }

  return raw as BookMeta;
}

/** Nomor pasal (urut) yang sudah punya file pasal-N.mdx untuk satu kitab */
export function getAvailablePasalNumbers(bookSlug: string): number[] {
  if (!isSafeBookSlug(bookSlug)) return [];
  const bookDir = path.join(CONTENT_DIR, bookSlug);
  return safeReadDir(bookDir)
    .map((file) => file.match(/^pasal-(\d+)\.mdx?$/))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => Number(match[1]))
    .sort((a, b) => a - b);
}

/** Semua kitab yang sudah punya konten, digabung dengan data taksonomi. */
export function getAllBooksWithContent(): BookWithContent[] {
  return getAvailableBookSlugs()
    .map((slug): BookWithContent | null => {
      const taxonomy = getBookTaxonomy(slug);
      const meta = getBookMeta(slug);
      if (!taxonomy || !meta) return null;
      return {
        ...taxonomy,
        meta,
        availablePasal: getAvailablePasalNumbers(slug),
      };
    })
    .filter((book): book is BookWithContent => book !== null)
    .sort((a, b) => a.canonicalOrder - b.canonicalOrder);
}

export function getBookWithContent(bookSlug: string): BookWithContent | null {
  const taxonomy = getBookTaxonomy(bookSlug);
  const meta = getBookMeta(bookSlug);
  if (!taxonomy || !meta) return null;
  return {
    ...taxonomy,
    meta,
    availablePasal: getAvailablePasalNumbers(bookSlug),
  };
}

/** Baca satu artikel eksposisi pasal tertentu. */
export function getArticle(bookSlug: string, pasal: number): Article | null {
  if (!isSafeBookSlug(bookSlug) || !isSafePasal(pasal)) return null;
  const filePath = path.join(CONTENT_DIR, bookSlug, `pasal-${pasal}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const book = getBookTaxonomy(bookSlug);
  const frontmatter = data as Partial<ArticleFrontmatter>;
  const dateValue: unknown = frontmatter.date;
  const validDate =
    (typeof dateValue === "string" || dateValue instanceof Date) &&
    !Number.isNaN(new Date(dateValue).getTime());
  const validTags =
    frontmatter.tags === undefined ||
    (Array.isArray(frontmatter.tags) && frontmatter.tags.every((tag) => typeof tag === "string"));

  if (
    !book ||
    typeof frontmatter.title !== "string" ||
    frontmatter.title.trim() === "" ||
    frontmatter.kitab !== bookSlug ||
    frontmatter.pasal !== pasal ||
    typeof frontmatter.author !== "string" ||
    frontmatter.author.trim() === "" ||
    !validDate ||
    !validTags
  ) {
    throw new Error(`Frontmatter artikel tidak valid: content/${bookSlug}/pasal-${pasal}.mdx`);
  }

  return {
    frontmatter: frontmatter as ArticleFrontmatter,
    content,
    slug: `${bookSlug}/pasal-${pasal}`,
  };
}

/** Semua artikel di seluruh kitab — dipakai untuk index pencarian & tag. */
export function getAllArticles(): Article[] {
  return getAvailableBookSlugs().flatMap((bookSlug) =>
    getAvailablePasalNumbers(bookSlug)
      .map((pasal) => getArticle(bookSlug, pasal))
      .filter((article): article is Article => article !== null)
  );
}

/** Semua tag unik dari seluruh artikel, untuk halaman /tema. */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const article of getAllArticles()) {
    for (const tag of article.frontmatter.tags ?? []) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort();
}

export function getArticlesByTag(tag: string): Article[] {
  return getAllArticles().filter((article) =>
    (article.frontmatter.tags ?? []).includes(tag)
  );
}
