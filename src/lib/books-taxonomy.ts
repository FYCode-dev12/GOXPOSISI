import type { BookGroup, BookTaxonomy, Testament } from "@/types/content";

/**
 * Data taksonomi statis untuk seluruh 66 kitab Alkitab.
 *
 * Ini SENGAJA berisi semua kitab, walau baru sebagian yang punya
 * folder di /content — supaya struktur navigasi (pengelompokan PL/PB
 * dan kategori) sudah rapi sejak awal dan tidak perlu diubah setiap
 * kali menambah kitab baru. Fungsi di lib/content.ts akan menyaring
 * kitab mana saja yang benar-benar sudah punya artikel.
 */
const RAW_BOOKS: Array<[string, string, Testament, BookGroup]> = [
  // Taurat
  ["kejadian", "Kejadian", "PL", "Taurat"],
  ["keluaran", "Keluaran", "PL", "Taurat"],
  ["imamat", "Imamat", "PL", "Taurat"],
  ["bilangan", "Bilangan", "PL", "Taurat"],
  ["ulangan", "Ulangan", "PL", "Taurat"],

  // Sejarah (PL)
  ["yosua", "Yosua", "PL", "Sejarah"],
  ["hakim-hakim", "Hakim-hakim", "PL", "Sejarah"],
  ["rut", "Rut", "PL", "Sejarah"],
  ["1-samuel", "1 Samuel", "PL", "Sejarah"],
  ["2-samuel", "2 Samuel", "PL", "Sejarah"],
  ["1-raja-raja", "1 Raja-raja", "PL", "Sejarah"],
  ["2-raja-raja", "2 Raja-raja", "PL", "Sejarah"],
  ["1-tawarikh", "1 Tawarikh", "PL", "Sejarah"],
  ["2-tawarikh", "2 Tawarikh", "PL", "Sejarah"],
  ["ezra", "Ezra", "PL", "Sejarah"],
  ["nehemia", "Nehemia", "PL", "Sejarah"],
  ["ester", "Ester", "PL", "Sejarah"],

  // Puisi
  ["ayub", "Ayub", "PL", "Puisi"],
  ["mazmur", "Mazmur", "PL", "Puisi"],
  ["amsal", "Amsal", "PL", "Puisi"],
  ["pengkhotbah", "Pengkhotbah", "PL", "Puisi"],
  ["kidung-agung", "Kidung Agung", "PL", "Puisi"],

  // Nabi Besar
  ["yesaya", "Yesaya", "PL", "Nabi Besar"],
  ["yeremia", "Yeremia", "PL", "Nabi Besar"],
  ["ratapan", "Ratapan", "PL", "Nabi Besar"],
  ["yehezkiel", "Yehezkiel", "PL", "Nabi Besar"],
  ["daniel", "Daniel", "PL", "Nabi Besar"],

  // Nabi Kecil
  ["hosea", "Hosea", "PL", "Nabi Kecil"],
  ["yoel", "Yoel", "PL", "Nabi Kecil"],
  ["amos", "Amos", "PL", "Nabi Kecil"],
  ["obaja", "Obaja", "PL", "Nabi Kecil"],
  ["yunus", "Yunus", "PL", "Nabi Kecil"],
  ["mikha", "Mikha", "PL", "Nabi Kecil"],
  ["nahum", "Nahum", "PL", "Nabi Kecil"],
  ["habakuk", "Habakuk", "PL", "Nabi Kecil"],
  ["zefanya", "Zefanya", "PL", "Nabi Kecil"],
  ["hagai", "Hagai", "PL", "Nabi Kecil"],
  ["zakharia", "Zakharia", "PL", "Nabi Kecil"],
  ["maleakhi", "Maleakhi", "PL", "Nabi Kecil"],

  // Injil
  ["matius", "Matius", "PB", "Injil"],
  ["markus", "Markus", "PB", "Injil"],
  ["lukas", "Lukas", "PB", "Injil"],
  ["yohanes", "Yohanes", "PB", "Injil"],

  // Sejarah Gereja
  ["kisah-para-rasul", "Kisah Para Rasul", "PB", "Sejarah Gereja"],

  // Surat Paulus
  ["roma", "Roma", "PB", "Surat Paulus"],
  ["1-korintus", "1 Korintus", "PB", "Surat Paulus"],
  ["2-korintus", "2 Korintus", "PB", "Surat Paulus"],
  ["galatia", "Galatia", "PB", "Surat Paulus"],
  ["efesus", "Efesus", "PB", "Surat Paulus"],
  ["filipi", "Filipi", "PB", "Surat Paulus"],
  ["kolose", "Kolose", "PB", "Surat Paulus"],
  ["1-tesalonika", "1 Tesalonika", "PB", "Surat Paulus"],
  ["2-tesalonika", "2 Tesalonika", "PB", "Surat Paulus"],
  ["1-timotius", "1 Timotius", "PB", "Surat Paulus"],
  ["2-timotius", "2 Timotius", "PB", "Surat Paulus"],
  ["titus", "Titus", "PB", "Surat Paulus"],
  ["filemon", "Filemon", "PB", "Surat Paulus"],

  // Surat Umum
  ["ibrani", "Ibrani", "PB", "Surat Umum"],
  ["yakobus", "Yakobus", "PB", "Surat Umum"],
  ["1-petrus", "1 Petrus", "PB", "Surat Umum"],
  ["2-petrus", "2 Petrus", "PB", "Surat Umum"],
  ["1-yohanes", "1 Yohanes", "PB", "Surat Umum"],
  ["2-yohanes", "2 Yohanes", "PB", "Surat Umum"],
  ["3-yohanes", "3 Yohanes", "PB", "Surat Umum"],
  ["yudas", "Yudas", "PB", "Surat Umum"],

  // Nubuat
  ["wahyu", "Wahyu", "PB", "Nubuat"],
];

export const BOOKS_TAXONOMY: BookTaxonomy[] = RAW_BOOKS.map(
  ([slug, name, testament, group], index) => ({
    slug,
    name,
    testament,
    group,
    canonicalOrder: index + 1,
  })
);

/** Urutan kelompok kitab saat ditampilkan di navigasi. */
export const GROUP_ORDER: BookGroup[] = [
  "Taurat",
  "Sejarah",
  "Puisi",
  "Nabi Besar",
  "Nabi Kecil",
  "Injil",
  "Sejarah Gereja",
  "Surat Paulus",
  "Surat Umum",
  "Nubuat",
];

export function getBookTaxonomy(slug: string): BookTaxonomy | undefined {
  return BOOKS_TAXONOMY.find((book) => book.slug === slug);
}

export function getBooksByTestament(testament: Testament): BookTaxonomy[] {
  return BOOKS_TAXONOMY.filter((book) => book.testament === testament).sort(
    (a, b) => a.canonicalOrder - b.canonicalOrder
  );
}
