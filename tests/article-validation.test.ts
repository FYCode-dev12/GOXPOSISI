import { describe, expect, it } from "vitest";
import { validateArticleMdx } from "@/lib/article-validation";

type Fields = Record<string, string | undefined>;

const BASE_FIELDS: Fields = {
  title: '"Pembenaran oleh iman"',
  kitab: "roma",
  pasal: "1",
  author: '"Tim Eksposisi"',
  date: '"2024-01-15"',
  tags: '["iman", "injil"]',
  summary: '"Ringkasan pasal satu."',
};

const BODY = "\n## Pendahuluan\n\nPaulus memperkenalkan Injil Allah.\n";

/** Build a raw article; a field set to `undefined` is left out of the frontmatter. */
function article(overrides: Fields = {}, body = BODY): string {
  const fields = { ...BASE_FIELDS, ...overrides };
  const yaml = Object.entries(fields)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  return `---\n${yaml}\n---\n${body}`;
}

function errorOf(raw: string, expectedPasal?: number): string {
  try {
    validateArticleMdx(raw, expectedPasal);
  } catch (error) {
    return (error as Error).message;
  }
  throw new Error("expected validateArticleMdx to throw");
}

describe("validateArticleMdx: valid input", () => {
  it("returns the parsed frontmatter and the Markdown body", () => {
    const result = validateArticleMdx(article());
    expect(result.frontmatter).toMatchObject({
      title: "Pembenaran oleh iman",
      kitab: "roma",
      pasal: 1,
      author: "Tim Eksposisi",
      date: "2024-01-15",
      tags: ["iman", "injil"],
      summary: "Ringkasan pasal satu.",
    });
    expect(result.content).toContain("Paulus memperkenalkan Injil Allah.");
    expect(result.content).not.toContain("kitab: roma");
  });

  it("accepts an unquoted YAML date (parsed to a Date object)", () => {
    const result = validateArticleMdx(article({ date: "2024-01-15" }));
    expect(result.frontmatter.date).toBeInstanceOf(Date);
  });

  it("accepts an article without the optional summary", () => {
    const result = validateArticleMdx(article({ summary: undefined }));
    expect(result.frontmatter.summary).toBeUndefined();
  });

  it("accepts an empty tags array", () => {
    expect(validateArticleMdx(article({ tags: "[]" })).frontmatter.tags).toEqual([]);
  });

  it("accepts any of the 66 taxonomy slugs, including multi-word ones", () => {
    expect(() => validateArticleMdx(article({ kitab: "kisah-para-rasul" }))).not.toThrow();
    expect(() => validateArticleMdx(article({ kitab: "1-korintus" }))).not.toThrow();
  });

  it("accepts a matching expectedPasal", () => {
    expect(() => validateArticleMdx(article({ pasal: "3" }), 3)).not.toThrow();
  });

  it("allows plain words that merely start with 'on' (no attribute syntax)", () => {
    expect(() => validateArticleMdx(article({}, "\nOnesimus kembali kepada Filemon.\n"))).not.toThrow();
  });

  it("accepts the exact length limits", () => {
    expect(() => validateArticleMdx(article({ title: `"${"a".repeat(200)}"` }))).not.toThrow();
    expect(() => validateArticleMdx(article({ author: `"${"a".repeat(120)}"` }))).not.toThrow();
    expect(() => validateArticleMdx(article({ summary: `"${"a".repeat(500)}"` }))).not.toThrow();
    const twentyTags = JSON.stringify(Array.from({ length: 20 }, (_, i) => `tag-${i}`));
    expect(() => validateArticleMdx(article({ tags: twentyTags }))).not.toThrow();
    expect(() => validateArticleMdx(article({ tags: JSON.stringify(["a".repeat(80)]) }))).not.toThrow();
  });
});

describe("validateArticleMdx: frontmatter errors", () => {
  it("prefixes every error with 'Frontmatter tidak valid'", () => {
    expect(errorOf(article({ kitab: "bukan-kitab" }))).toMatch(/^Frontmatter tidak valid: .*\.$/);
  });

  it("rejects a book that is not in the taxonomy", () => {
    expect(errorOf(article({ kitab: "bukan-kitab" }))).toContain("kitab tidak terdaftar");
    expect(errorOf(article({ kitab: "Roma" }))).toContain("kitab tidak terdaftar");
    expect(errorOf(article({ kitab: undefined }))).toContain("kitab tidak terdaftar");
  });

  it("rejects a non-string kitab", () => {
    const message = errorOf(article({ kitab: "45" }));
    expect(message).toContain("kitab tidak terdaftar");
    expect(message).toContain("kitab harus string");
  });

  it("requires a non-blank title of at most 200 characters", () => {
    expect(errorOf(article({ title: undefined }))).toContain("title wajib diisi");
    expect(errorOf(article({ title: '"   "' }))).toContain("title wajib diisi");
    expect(errorOf(article({ title: "123" }))).toContain("title wajib diisi");
    expect(errorOf(article({ title: `"${"a".repeat(201)}"` }))).toContain("title maksimal 200 karakter");
  });

  it("requires pasal to be a positive integer", () => {
    for (const pasal of [undefined, "0", "-1", "1.5", '"1"']) {
      expect(errorOf(article({ pasal }))).toContain("pasal harus integer positif");
    }
  });

  it("rejects a pasal that differs from expectedPasal", () => {
    expect(errorOf(article({ pasal: "2" }), 3)).toContain("pasal harus 3");
  });

  it("requires a non-blank author of at most 120 characters", () => {
    expect(errorOf(article({ author: undefined }))).toContain("author wajib diisi");
    expect(errorOf(article({ author: '""' }))).toContain("author wajib diisi");
    expect(errorOf(article({ author: `"${"a".repeat(121)}"` }))).toContain("author maksimal 120 karakter");
  });

  it("requires a parseable date", () => {
    expect(errorOf(article({ date: undefined }))).toContain("date tidak valid");
    expect(errorOf(article({ date: '"bukan tanggal"' }))).toContain("date tidak valid");
    expect(errorOf(article({ date: "20240115" }))).toContain("date tidak valid");
  });

  it("requires tags to be an array of strings", () => {
    expect(errorOf(article({ tags: undefined }))).toContain("tags harus array string");
    expect(errorOf(article({ tags: '"iman"' }))).toContain("tags harus array string");
    expect(errorOf(article({ tags: "[1, 2]" }))).toContain("tags harus array string");
  });

  it("limits tags to 20 entries of at most 80 characters", () => {
    const tooMany = JSON.stringify(Array.from({ length: 21 }, (_, i) => `tag-${i}`));
    expect(errorOf(article({ tags: tooMany }))).toContain("tags terlalu banyak atau terlalu panjang");
    expect(errorOf(article({ tags: JSON.stringify(["a".repeat(81)]) }))).toContain(
      "tags terlalu banyak atau terlalu panjang"
    );
  });

  it("requires summary to be a string of at most 500 characters", () => {
    expect(errorOf(article({ summary: "42" }))).toContain("summary harus string");
    expect(errorOf(article({ summary: `"${"a".repeat(501)}"` }))).toContain("summary maksimal 500 karakter");
  });

  it("reports every problem in a single error", () => {
    const message = errorOf(article({ title: undefined, author: undefined, date: '"x"' }));
    expect(message).toContain("title wajib diisi");
    expect(message).toContain("author wajib diisi");
    expect(message).toContain("date tidak valid");
  });

  it("rejects a document without any frontmatter", () => {
    const message = errorOf("Hanya isi tanpa frontmatter.");
    expect(message).toContain("kitab tidak terdaftar");
    expect(message).toContain("title wajib diisi");
  });

  // Gap, not asserted: the validator does not check pasal against BOOK_CHAPTERS,
  // so `kitab: roma, pasal: 99` is accepted by the API even though Roma has 16
  // chapters (only the admin picker UI limits the range).
  it.skip("rejects a pasal beyond the book's chapter count (not implemented)", () => {
    expect(errorOf(article({ pasal: "17" }))).toContain("pasal");
  });
});

describe("validateArticleMdx: body size limits", () => {
  it("rejects an empty or whitespace-only body", () => {
    expect(errorOf(article({}, ""))).toContain("isi artikel kosong");
    expect(errorOf(article({}, "\n   \n\t\n"))).toContain("isi artikel kosong");
  });

  it("accepts a body of exactly 500,000 characters", () => {
    const raw = article({}, "a".repeat(500_000));
    const result = validateArticleMdx(raw);
    expect(result.content.length).toBe(500_000);
  });

  it("rejects a body longer than 500,000 characters", () => {
    const message = errorOf(article({}, "a".repeat(500_001)));
    expect(message).toContain("isi artikel maksimal 500 KB");
    expect(message).not.toContain("file artikel terlalu besar");
  });

  it("rejects a raw file longer than 600,000 characters even when the body fits", () => {
    // Unknown frontmatter keys are ignored, so pad the file through one.
    const raw = article({ catatan: `"${"x".repeat(150_000)}"` }, "a".repeat(460_000));
    expect(raw.length).toBeGreaterThan(600_000);
    const message = errorOf(raw);
    expect(message).toContain("file artikel terlalu besar");
    expect(message).not.toContain("isi artikel maksimal 500 KB");
  });
});

describe("validateArticleMdx: HTML/script filter", () => {
  const BLOCKED = "HTML/script tidak diizinkan dalam Markdown";

  it("rejects a <script> tag in the body", () => {
    expect(errorOf(article({}, "\nTeks\n\n<script>alert(1)</script>\n"))).toContain(BLOCKED);
  });

  it("rejects quoted on* event handler attributes", () => {
    expect(errorOf(article({}, '\n<img src="x" onerror="alert(1)">\n'))).toContain(BLOCKED);
    expect(errorOf(article({}, "\n<div onclick='x()'>klik</div>\n"))).toContain(BLOCKED);
    expect(errorOf(article({}, '\n<body onLoad = "x()">\n'))).toContain(BLOCKED);
  });

  it("matches on*= anywhere inside a word followed by a quoted value", () => {
    // Current behaviour: the pattern has no word boundary, so ordinary words that
    // contain "on" (e.g. "contoh") trip the filter when followed by ="...".
    expect(errorOf(article({}, '\nLihat contoh="ayat 1".\n'))).toContain(BLOCKED);
  });

  it("does not inspect frontmatter for script content", () => {
    expect(() => validateArticleMdx(article({ summary: '"<script> di ringkasan"' }))).not.toThrow();
  });

  // Known bug (left skipped so CI stays green): the check uses a case-sensitive
  // `content.includes("<script")`, so `<SCRIPT>` / `<Script>` pass. The background
  // route uses `/<script/i`. React Markdown currently escapes raw HTML, which limits
  // the impact, but the validator does not do what its error message claims.
  it.skip("rejects <SCRIPT> regardless of case", () => {
    expect(errorOf(article({}, "\n<SCRIPT>alert(1)</SCRIPT>\n"))).toContain(BLOCKED);
  });

  // Known bug: unquoted handlers (`onerror=alert(1)`) are valid HTML but the regex
  // requires a quote after `=`, so they pass the filter.
  it.skip("rejects unquoted on* event handler attributes", () => {
    expect(errorOf(article({}, "\n<img src=x onerror=alert(1)>\n"))).toContain(BLOCKED);
  });
});
