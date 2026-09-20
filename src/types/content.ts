/**
 * Tipe data untuk struktur konten: Kitab > Pasal > Artikel eksposisi.
 */

export type Testament = "PL" | "PB";

/**
 * Kelompok kitab untuk navigasi hierarkis, supaya daftar kitab tidak
 * ditampilkan sebagai satu daftar datar.
 */
export type BookGroup =
  | "Taurat"
  | "Sejarah"
  | "Puisi"
  | "Nabi Besar"
  | "Nabi Kecil"
  | "Injil"
  | "Sejarah Gereja"
  | "Surat Paulus"
  | "Surat Umum"
  | "Nubuat";

/**
 * Data taksonomi statis satu kitab (dipakai untuk navigasi),
 * berlaku untuk seluruh 66 kitab meski belum semua punya konten.
 */
export interface BookTaxonomy {
  slug: string;
  name: string;
  testament: Testament;
  group: BookGroup;
  /** Urutan kitab dalam urutan kanon Alkitab (1-66) */
  canonicalOrder: number;
}

/**
 * Isi file meta.json di setiap folder /content/<kitab>/
 */
export interface BookMeta {
  name: string;
  testament: Testament;
  order: number;
  totalPasal: number;
}

/**
 * Frontmatter pada setiap file pasal-N.mdx
 */
export interface ArticleFrontmatter {
  title: string;
  kitab: string;
  pasal: number;
  author: string;
  date: string;
  summary?: string;
  tags?: string[];
}

/**
 * Satu artikel eksposisi lengkap dengan konten MDX mentah.
 */
export interface Article {
  frontmatter: ArticleFrontmatter;
  content: string;
  slug: string; // contoh: "roma/pasal-1"
}

/**
 * Gabungan taksonomi kitab + meta konten, dipakai untuk navigasi
 * yang hanya menampilkan kitab yang sudah punya artikel.
 */
export interface BookWithContent extends BookTaxonomy {
  meta: BookMeta;
  availablePasal: number[];
}
