import fs from "node:fs";
import path from "node:path";
import type { Article, BookMeta, BookWithContent } from "@/types/content";
import { getBookTaxonomy } from "@/lib/books-taxonomy";
import { getSupabasePublicClient } from "@/lib/supabase/public";
import { validateArticleMdx } from "@/lib/article-validation";

export interface BookBackground {
  kitab: string;
  content: string;
}

export async function getBookBackground(bookSlug: string): Promise<BookBackground | null> {
  if (!isSafeBookSlug(bookSlug)) return null;
  const client = getSupabasePublicClient();
  if (!client) return null;
  const { data, error } = await client.from("book_backgrounds").select("kitab,content").eq("kitab", bookSlug).maybeSingle();
  if (error) {
    if (error.code === "42P01") return null;
    throw new Error(`Gagal membaca latar belakang kitab: ${error.message}`);
  }
  return data;
}

export async function getBookBackgrounds(): Promise<BookBackground[]> {
  const client = getSupabasePublicClient();
  if (!client) return [];
  const { data, error } = await client.from("book_backgrounds").select("kitab,content");
  if (error) throw new Error(`Gagal membaca latar belakang kitab: ${error.message}`);
  return data ?? [];
}

function isSafeBookSlug(slug: string) { return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && Boolean(getBookTaxonomy(slug)); }

const CONTENT_DIR = path.join(process.cwd(), "content");
const SELECT = "kitab,pasal,title,summary,tags,author,date,content,status";

function isSafePasal(pasal: number) { return Number.isInteger(pasal) && pasal > 0; }
function safeReadDir(dir: string): string[] { try { return fs.readdirSync(dir); } catch { return []; } }
function staticBookSlugs() { return safeReadDir(CONTENT_DIR).filter((entry) => isSafeBookSlug(entry) && fs.statSync(path.join(CONTENT_DIR, entry)).isDirectory() && fs.existsSync(path.join(CONTENT_DIR, entry, "meta.json"))); }

function getStaticMeta(bookSlug: string): BookMeta | null {
  if (!isSafeBookSlug(bookSlug)) return null;
  const file = path.join(CONTENT_DIR, bookSlug, "meta.json");
  if (!fs.existsSync(file)) return null;
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as Partial<BookMeta>;
  const taxonomy = getBookTaxonomy(bookSlug);
  if (!taxonomy || raw.name !== taxonomy.name || raw.testament !== taxonomy.testament || typeof raw.order !== "number" || !Number.isInteger(raw.order) || typeof raw.totalPasal !== "number" || !Number.isInteger(raw.totalPasal) || raw.totalPasal <= 0) throw new Error(`Metadata kitab tidak valid: content/${bookSlug}/meta.json`);
  return raw as BookMeta;
}
function staticPasals(bookSlug: string) { return safeReadDir(path.join(CONTENT_DIR, bookSlug)).map((file) => file.match(/^pasal-(\d+)\.md(?:x)?$/)).filter((m): m is RegExpMatchArray => Boolean(m)).map((m) => Number(m[1])).sort((a, b) => a - b); }
function getStaticArticle(bookSlug: string, pasal: number): Article | null {
  if (!isSafeBookSlug(bookSlug) || !isSafePasal(pasal)) return null;
  const mdFile = path.join(CONTENT_DIR, bookSlug, `pasal-${pasal}.md`);
  const mdxFile = path.join(CONTENT_DIR, bookSlug, `pasal-${pasal}.mdx`);
  const file = fs.existsSync(mdFile) ? mdFile : mdxFile;
  if (!fs.existsSync(file)) return null;
  const validated = validateArticleMdx(fs.readFileSync(file, "utf8"), pasal);
  return { frontmatter: validated.frontmatter, content: validated.content, slug: `${bookSlug}/pasal-${pasal}` };
}
function rowToArticle(item: { kitab: string; pasal: number; title: string; summary: string | null; tags: unknown; author: string; date: string; content: string }): Article {
  return { frontmatter: { title: item.title, kitab: item.kitab, pasal: item.pasal, author: item.author, date: item.date, summary: item.summary ?? undefined, tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === "string") : [] }, content: item.content, slug: `${item.kitab}/pasal-${item.pasal}` };
}
async function queryArticle(bookSlug: string, pasal: number): Promise<Article | null> {
  const client = getSupabasePublicClient();
  if (!client) return null;
  const { data, error } = await client.from("articles").select(SELECT).eq("kitab", bookSlug).eq("pasal", pasal).eq("status", "published").maybeSingle();
  if (error) throw new Error(`Gagal membaca artikel Supabase: ${error.message}`);
  return data ? rowToArticle(data) : null;
}
async function queryPublishedArticles(): Promise<Article[]> {
  const client = getSupabasePublicClient();
  if (!client) return [];
  const { data, error } = await client.from("articles").select(SELECT).eq("status", "published");
  if (error) throw new Error(`Gagal membaca daftar artikel Supabase: ${error.message}`);
  return (data ?? []).map(rowToArticle);
}
async function mergedArticles(): Promise<Article[]> {
  const statics = staticBookSlugs().flatMap((slug) => staticPasals(slug).map((pasal) => getStaticArticle(slug, pasal)).filter((article): article is Article => article !== null));
  const bySlug = new Map(statics.map((article) => [article.slug, article]));
  for (const article of await queryPublishedArticles()) bySlug.set(article.slug, article);
  return Array.from(bySlug.values());
}
function booksFromArticles(articles: Article[]): BookWithContent[] {
  const pasals = new Map<string, Set<number>>();
  for (const article of articles) { const values = pasals.get(article.frontmatter.kitab) ?? new Set<number>(); values.add(article.frontmatter.pasal); pasals.set(article.frontmatter.kitab, values); }
  return Array.from(pasals.entries()).map(([slug, numbers]) => { const taxonomy = getBookTaxonomy(slug); const meta = getStaticMeta(slug); return taxonomy && meta ? { ...taxonomy, meta, availablePasal: Array.from(numbers).sort((a, b) => a - b) } : null; }).filter((book): book is BookWithContent => book !== null).sort((a, b) => a.canonicalOrder - b.canonicalOrder);
}

export async function getAllBooksWithContent() { return booksFromArticles(await mergedArticles()); }
export async function getBookWithContent(bookSlug: string) { return (await getAllBooksWithContent()).find((book) => book.slug === bookSlug) ?? null; }
export async function getArticle(bookSlug: string, pasal: number) { return (await queryArticle(bookSlug, pasal)) ?? getStaticArticle(bookSlug, pasal); }
export async function getAllArticles() { return mergedArticles(); }
export async function getAllTags() { const tags = new Set<string>(); for (const article of await mergedArticles()) for (const tag of article.frontmatter.tags ?? []) tags.add(tag); return Array.from(tags).sort(); }
export async function getArticlesByTag(tag: string) { return (await mergedArticles()).filter((article) => (article.frontmatter.tags ?? []).includes(tag)); }
