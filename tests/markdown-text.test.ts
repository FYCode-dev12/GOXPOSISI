import { describe, expect, it } from "vitest";
import { stripMarkdown } from "@/lib/markdown-text";

describe("stripMarkdown", () => {
  it("removes headings, emphasis and blockquote markers", () => {
    expect(stripMarkdown("# Judul\n\n> **Kasih** itu _sabar_ ~~marah~~")).toBe("Judul Kasih itu sabar marah");
  });

  it("keeps link labels and drops URLs and images", () => {
    expect(stripMarkdown("Baca [Roma 1](/kitab/roma/1) ![peta](/peta.png) sekarang")).toBe("Baca Roma 1 sekarang");
  });

  it("drops fenced code blocks and unwraps inline code", () => {
    expect(stripMarkdown("Sebelum\n```js\nconst x = 1;\n```\nlalu `kode` sesudah")).toBe("Sebelum lalu kode sesudah");
  });

  it("removes HTML/JSX tags but keeps their text", () => {
    expect(stripMarkdown("<div class=\"x\">Isi</div><br/>akhir")).toBe("Isi akhir");
  });

  it("collapses whitespace and trims", () => {
    expect(stripMarkdown("  satu\n\n\tdua   tiga  ")).toBe("satu dua tiga");
    expect(stripMarkdown("")).toBe("");
  });
});
