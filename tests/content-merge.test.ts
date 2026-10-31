import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * lib/content.ts merges local Markdown under `<cwd>/content` with published
 * Supabase rows. These tests point `cwd` at tests/fixtures and replace the
 * public Supabase client with an in-memory fake, so no network is used.
 *
 * Fixture layout (tests/fixtures/content):
 *   roma/      meta.json, pasal-1.md, pasal-2.md, catatan.md (not a pasal file)
 *   galatia/   meta.json, pasal-1.mdx
 *   filipi/    pasal-1.md but no meta.json  -> ignored
 *   not_a_book/ meta.json + pasal-1.md, slug not in taxonomy -> ignored
 */

const FIXTURE_ROOT = path.join(__dirname, "fixtures");

type Row = {
  kitab: string;
  pasal: number;
  title: string;
  summary: string | null;
  tags: unknown;
  author: string;
  date: string;
  content: string;
  status: "published" | "draft";
};

const state = vi.hoisted(() => ({
  configured: true,
  rows: [] as Record<string, unknown>[],
  error: null as { message: string; code?: string } | null,
  queries: [] as { table: string; filters: Record<string, unknown> }[],
}));

vi.mock("@/lib/supabase/public", () => ({
  getSupabasePublicClient: () => {
    if (!state.configured) return null;
    return {
      from(table: string) {
        const filters: Record<string, unknown> = {};
        state.queries.push({ table, filters });
        const result = () => {
          if (state.error) return { data: null, error: state.error };
          const data = state.rows.filter((row) =>
            Object.entries(filters).every(([key, value]) => row[key] === value)
          );
          return { data, error: null };
        };
        const builder = {
          select: () => builder,
          eq(column: string, value: unknown) {
            filters[column] = value;
            return builder;
          },
          maybeSingle: async () => {
            const { data, error } = result();
            return { data: data?.[0] ?? null, error };
          },
          then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
            return Promise.resolve(result()).then(resolve, reject);
          },
        };
        return builder;
      },
    };
  },
}));

function row(overrides: Partial<Row>): Row {
  return {
    kitab: "roma",
    pasal: 1,
    title: "Judul",
    summary: null,
    tags: [],
    author: "Penulis Supabase",
    date: "2024-06-01",
    content: "Isi Supabase.",
    status: "published",
    ...overrides,
  };
}

async function loadContent() {
  vi.resetModules();
  const cwd = vi.spyOn(process, "cwd").mockReturnValue(FIXTURE_ROOT);
  try {
    // CONTENT_DIR is computed when the module is first evaluated.
    return await import("@/lib/content");
  } finally {
    cwd.mockRestore();
  }
}

beforeEach(() => {
  state.configured = true;
  state.rows = [];
  state.error = null;
  state.queries = [];
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getAllArticles: local Markdown only", () => {
  it("reads pasal-N.md and pasal-N.mdx from book folders that have meta.json", async () => {
    state.configured = false;
    const { getAllArticles } = await loadContent();
    const articles = await getAllArticles();
    expect(articles.map((article) => article.slug).sort()).toEqual([
      "galatia/pasal-1",
      "roma/pasal-1",
      "roma/pasal-2",
    ]);
    const roma1 = articles.find((article) => article.slug === "roma/pasal-1")!;
    expect(roma1.frontmatter.title).toBe("Roma 1 (lokal)");
    expect(roma1.content).toContain("Isi lokal **Roma 1**.");
  });

  it("returns the same local set when Supabase has no published rows", async () => {
    const { getAllArticles } = await loadContent();
    expect(await getAllArticles()).toHaveLength(3);
    expect(state.queries).toEqual([{ table: "articles", filters: { status: "published" } }]);
  });
});

describe("getAllArticles: merge with Supabase", () => {
  beforeEach(() => {
    state.rows = [
      row({ pasal: 2, title: "Roma 2 (Supabase)", content: "Isi Supabase Roma 2.", tags: ["supabase"] }),
      row({ pasal: 3, title: "Roma 3 (Supabase)", summary: "Ringkasan", tags: ["baru", 7, null] }),
      row({ pasal: 4, title: "Roma 4 (draft)", status: "draft" }),
      row({ kitab: "efesus", pasal: 1, title: "Efesus 1 (Supabase)" }),
    ];
  });

  it("lets the Supabase row win when the slug matches a local file", async () => {
    const { getAllArticles } = await loadContent();
    const articles = await getAllArticles();
    const roma2 = articles.filter((article) => article.slug === "roma/pasal-2");
    expect(roma2).toHaveLength(1);
    expect(roma2[0].frontmatter.title).toBe("Roma 2 (Supabase)");
    expect(roma2[0].content).toBe("Isi Supabase Roma 2.");
    expect(roma2[0].frontmatter.tags).toEqual(["supabase"]);
  });

  it("keeps local files that have no Supabase counterpart and adds Supabase-only rows", async () => {
    const { getAllArticles } = await loadContent();
    const slugs = (await getAllArticles()).map((article) => article.slug).sort();
    expect(slugs).toEqual(["efesus/pasal-1", "galatia/pasal-1", "roma/pasal-1", "roma/pasal-2", "roma/pasal-3"]);
  });

  it("only asks Supabase for published rows (drafts never merge)", async () => {
    const { getAllArticles } = await loadContent();
    const slugs = (await getAllArticles()).map((article) => article.slug);
    expect(slugs).not.toContain("roma/pasal-4");
  });

  it("maps a row to an article: null summary -> undefined, non-string tags dropped", async () => {
    const { getAllArticles } = await loadContent();
    const articles = await getAllArticles();
    const roma3 = articles.find((article) => article.slug === "roma/pasal-3")!;
    expect(roma3.frontmatter).toEqual({
      title: "Roma 3 (Supabase)",
      kitab: "roma",
      pasal: 3,
      author: "Penulis Supabase",
      date: "2024-06-01",
      summary: "Ringkasan",
      tags: ["baru"],
    });
    const efesus = articles.find((article) => article.slug === "efesus/pasal-1")!;
    expect(efesus.frontmatter.summary).toBeUndefined();
  });

  it("treats non-array tags from Supabase as no tags", async () => {
    state.rows = [row({ pasal: 9, tags: "bukan-array" })];
    const { getAllArticles } = await loadContent();
    const article = (await getAllArticles()).find((item) => item.slug === "roma/pasal-9")!;
    expect(article.frontmatter.tags).toEqual([]);
  });

  it("propagates Supabase errors", async () => {
    state.error = { message: "boom" };
    const { getAllArticles } = await loadContent();
    await expect(getAllArticles()).rejects.toThrow("Gagal membaca daftar artikel Supabase: boom");
  });
});

describe("getArticle", () => {
  it("prefers the published Supabase row for the same kitab/pasal", async () => {
    state.rows = [row({ pasal: 2, title: "Roma 2 (Supabase)" })];
    const { getArticle } = await loadContent();
    expect((await getArticle("roma", 2))?.frontmatter.title).toBe("Roma 2 (Supabase)");
  });

  it("falls back to local Markdown when Supabase has no row", async () => {
    const { getArticle } = await loadContent();
    expect((await getArticle("roma", 1))?.frontmatter.title).toBe("Roma 1 (lokal)");
    expect((await getArticle("galatia", 1))?.frontmatter.title).toBe("Galatia 1 (mdx)");
  });

  it("falls back to local Markdown when Supabase is not configured", async () => {
    state.configured = false;
    const { getArticle } = await loadContent();
    expect((await getArticle("roma", 2))?.frontmatter.title).toBe("Roma 2 (lokal)");
  });

  it("returns null for missing articles and unsafe slugs or pasal values", async () => {
    state.configured = false;
    const { getArticle } = await loadContent();
    expect(await getArticle("roma", 5)).toBeNull();
    expect(await getArticle("filipi", 1)).not.toBeNull(); // file exists; meta.json is only needed for listings
    expect(await getArticle("../roma", 1)).toBeNull();
    expect(await getArticle("not_a_book", 1)).toBeNull();
    expect(await getArticle("roma", 0)).toBeNull();
    expect(await getArticle("roma", 1.5)).toBeNull();
  });
});

describe("book listings and tags", () => {
  beforeEach(() => {
    state.rows = [
      row({ pasal: 2, title: "Roma 2 (Supabase)", tags: ["supabase"] }),
      row({ pasal: 5, tags: ["supabase", "anugerah"] }),
      row({ kitab: "efesus", pasal: 1, tags: ["efesus"] }),
    ];
  });

  it("lists books that have articles, with merged chapter numbers in order", async () => {
    const { getAllBooksWithContent } = await loadContent();
    const books = await getAllBooksWithContent();
    expect(books.map((book) => [book.slug, book.availablePasal])).toEqual([
      ["roma", [1, 2, 5]],
      ["galatia", [1]],
    ]);
    expect(books[0].meta).toEqual({ name: "Roma", testament: "PB", order: 45, totalPasal: 16 });
  });

  it("omits books whose articles exist only in Supabase and that have no local meta.json", async () => {
    // Current behaviour: efesus/pasal-1 is returned by getAllArticles but its book
    // is missing from navigation because content/efesus/meta.json does not exist.
    const { getAllBooksWithContent, getBookWithContent, getAllArticles } = await loadContent();
    expect((await getAllArticles()).some((article) => article.slug === "efesus/pasal-1")).toBe(true);
    expect((await getAllBooksWithContent()).some((book) => book.slug === "efesus")).toBe(false);
    expect(await getBookWithContent("efesus")).toBeNull();
  });

  it("collects tags from the merged set (overridden local tags disappear)", async () => {
    const { getAllTags } = await loadContent();
    // roma/pasal-2 local tag "lokal" survives only via roma/pasal-1.
    expect(await getAllTags()).toEqual(["anugerah", "efesus", "injil", "kasih-karunia", "lokal", "supabase"]);
  });

  it("filters articles by tag", async () => {
    const { getArticlesByTag } = await loadContent();
    const slugs = (await getArticlesByTag("supabase")).map((article) => article.slug).sort();
    expect(slugs).toEqual(["roma/pasal-2", "roma/pasal-5"]);
    expect(await getArticlesByTag("tidak-ada")).toEqual([]);
  });
});

describe("buildSearchIndex", () => {
  it("indexes the merged articles with book names, hrefs and plain-text previews", async () => {
    state.rows = [row({ pasal: 2, title: "Roma 2 (Supabase)", content: "# Judul\n\nTeks **tebal**." })];
    vi.resetModules();
    const cwd = vi.spyOn(process, "cwd").mockReturnValue(FIXTURE_ROOT);
    const { buildSearchIndex } = await import("@/lib/search");
    cwd.mockRestore();

    const index = await buildSearchIndex();
    const roma2 = index.find((entry) => entry.slug === "roma/pasal-2")!;
    expect(roma2).toEqual({
      slug: "roma/pasal-2",
      href: "/kitab/roma/2",
      title: "Roma 2 (Supabase)",
      bookName: "Roma",
      pasal: 2,
      summary: "",
      tags: [],
      contentPreview: "Judul Teks tebal.",
    });
    expect(index.find((entry) => entry.slug === "galatia/pasal-1")?.bookName).toBe("Galatia");
  });
});
