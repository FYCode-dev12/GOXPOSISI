import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  BOOKS_TAXONOMY,
  BOOK_CHAPTERS,
  GROUP_ORDER,
  getBookTaxonomy,
  getBooksByTestament,
} from "@/lib/books-taxonomy";

describe("BOOKS_TAXONOMY", () => {
  it("lists all 66 books: 39 Old Testament and 27 New Testament", () => {
    expect(BOOKS_TAXONOMY).toHaveLength(66);
    expect(BOOKS_TAXONOMY.filter((book) => book.testament === "PL")).toHaveLength(39);
    expect(BOOKS_TAXONOMY.filter((book) => book.testament === "PB")).toHaveLength(27);
  });

  it("has unique, URL-safe kebab-case slugs", () => {
    const slugs = BOOKS_TAXONOMY.map((book) => book.slug);
    expect(new Set(slugs).size).toBe(66);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("numbers canonicalOrder 1..66 in array order", () => {
    expect(BOOKS_TAXONOMY.map((book) => book.canonicalOrder)).toEqual(
      Array.from({ length: 66 }, (_, index) => index + 1)
    );
  });

  it("starts with Kejadian, ends with Wahyu, and puts Matius at 40", () => {
    expect(BOOKS_TAXONOMY[0]).toMatchObject({ slug: "kejadian", name: "Kejadian", canonicalOrder: 1 });
    expect(BOOKS_TAXONOMY[39]).toMatchObject({ slug: "matius", testament: "PB", canonicalOrder: 40 });
    expect(BOOKS_TAXONOMY[65]).toMatchObject({ slug: "wahyu", group: "Nubuat", canonicalOrder: 66 });
  });

  it("puts every Old Testament book before every New Testament book", () => {
    const lastPL = Math.max(...getBooksByTestament("PL").map((book) => book.canonicalOrder));
    const firstPB = Math.min(...getBooksByTestament("PB").map((book) => book.canonicalOrder));
    expect(lastPL).toBe(39);
    expect(firstPB).toBe(40);
  });

  it("uses exactly the groups in GROUP_ORDER, contiguously and in that order", () => {
    const groupsInCanonOrder = BOOKS_TAXONOMY.map((book) => book.group).filter(
      (group, index, all) => index === 0 || all[index - 1] !== group
    );
    expect(groupsInCanonOrder).toEqual(GROUP_ORDER);
  });

  it("has the expected number of books per group", () => {
    const counts = Object.fromEntries(
      GROUP_ORDER.map((group) => [group, BOOKS_TAXONOMY.filter((book) => book.group === group).length])
    );
    expect(counts).toEqual({
      Taurat: 5,
      Sejarah: 12,
      Puisi: 5,
      "Nabi Besar": 5,
      "Nabi Kecil": 12,
      Injil: 4,
      "Sejarah Gereja": 1,
      "Surat Paulus": 13,
      "Surat Umum": 8,
      Nubuat: 1,
    });
  });
});

describe("getBookTaxonomy", () => {
  it("finds a book by slug", () => {
    expect(getBookTaxonomy("roma")).toEqual({
      slug: "roma",
      name: "Roma",
      testament: "PB",
      group: "Surat Paulus",
      canonicalOrder: 45,
    });
    expect(getBookTaxonomy("kisah-para-rasul")?.name).toBe("Kisah Para Rasul");
    expect(getBookTaxonomy("1-yohanes")?.name).toBe("1 Yohanes");
  });

  it("distinguishes numbered books from their base book", () => {
    expect(getBookTaxonomy("yohanes")?.canonicalOrder).toBe(43);
    expect(getBookTaxonomy("1-yohanes")?.canonicalOrder).toBe(62);
    expect(getBookTaxonomy("3-yohanes")?.canonicalOrder).toBe(64);
  });

  it("returns undefined for unknown, differently-cased or padded slugs", () => {
    for (const slug of ["", "bukan-kitab", "Roma", "ROMA", " roma", "roma/", "1 korintus", "romans"]) {
      expect(getBookTaxonomy(slug), slug).toBeUndefined();
    }
  });
});

describe("getBooksByTestament", () => {
  it("returns only books of the requested testament in canonical order", () => {
    const pl = getBooksByTestament("PL");
    const pb = getBooksByTestament("PB");
    expect(pl.every((book) => book.testament === "PL")).toBe(true);
    expect(pb.every((book) => book.testament === "PB")).toBe(true);
    expect(pl[0].slug).toBe("kejadian");
    expect(pl.at(-1)?.slug).toBe("maleakhi");
    expect(pb[0].slug).toBe("matius");
    expect(pb.at(-1)?.slug).toBe("wahyu");
    for (const list of [pl, pb]) {
      const orders = list.map((book) => book.canonicalOrder);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
    }
  });

  it("does not mutate the shared taxonomy array", () => {
    const before = BOOKS_TAXONOMY.map((book) => book.slug);
    getBooksByTestament("PB").reverse();
    expect(BOOKS_TAXONOMY.map((book) => book.slug)).toEqual(before);
  });
});

describe("BOOK_CHAPTERS", () => {
  it("has a chapter count for exactly the 66 taxonomy slugs", () => {
    expect(Object.keys(BOOK_CHAPTERS).sort()).toEqual(BOOKS_TAXONOMY.map((book) => book.slug).sort());
  });

  it("uses positive integer chapter counts", () => {
    for (const [slug, count] of Object.entries(BOOK_CHAPTERS)) {
      expect(Number.isInteger(count) && count > 0, slug).toBe(true);
    }
  });

  it("matches the Protestant canon: 929 OT + 260 NT = 1189 chapters", () => {
    const sum = (testament: "PL" | "PB") =>
      getBooksByTestament(testament).reduce((total, book) => total + BOOK_CHAPTERS[book.slug], 0);
    expect(sum("PL")).toBe(929);
    expect(sum("PB")).toBe(260);
  });

  it("has well-known chapter counts", () => {
    expect(BOOK_CHAPTERS).toMatchObject({
      kejadian: 50,
      mazmur: 150,
      yesaya: 66,
      obaja: 1,
      matius: 28,
      roma: 16,
      filemon: 1,
      "3-yohanes": 1,
      wahyu: 22,
    });
  });

  it("gives single-chapter books a chapter range of exactly [1]", () => {
    const singleChapter = Object.entries(BOOK_CHAPTERS)
      .filter(([, count]) => count === 1)
      .map(([slug]) => slug)
      .sort();
    expect(singleChapter).toEqual(["2-yohanes", "3-yohanes", "filemon", "obaja", "yudas"]);
  });
});

describe("content/*/meta.json", () => {
  const contentDir = path.join(process.cwd(), "content");
  const bookDirs = fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  it("only contains folders named after taxonomy slugs", () => {
    for (const slug of bookDirs) expect(getBookTaxonomy(slug), slug).toBeDefined();
  });

  it.each(bookDirs)("content/%s/meta.json agrees with the taxonomy", (slug) => {
    const meta = JSON.parse(fs.readFileSync(path.join(contentDir, slug, "meta.json"), "utf8"));
    const book = getBookTaxonomy(slug)!;
    expect(meta).toEqual({
      name: book.name,
      testament: book.testament,
      order: book.canonicalOrder,
      totalPasal: BOOK_CHAPTERS[slug],
    });
  });
});
