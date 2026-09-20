/**
 * Mengubah isi MDX/Markdown mentah menjadi teks polos, dipakai untuk
 * membangun index pencarian (tidak perlu parser MDX penuh untuk ini).
 */
export function stripMarkdown(source: string): string {
  return source
    .replace(/```[\s\S]*?```/g, " ") // blok kode
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ") // gambar
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1") // tautan -> label saja
    .replace(/^>\s?/gm, "") // blockquote
    .replace(/^#{1,6}\s+/gm, "") // heading
    .replace(/[*_~]{1,3}/g, "") // bold/italic/strikethrough
    .replace(/<[^>]+>/g, " ") // tag JSX/HTML
    .replace(/\s+/g, " ")
    .trim();
}
