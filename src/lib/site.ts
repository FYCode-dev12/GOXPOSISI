/**
 * URL situs untuk keperluan SEO (sitemap, robots, Open Graph, metadataBase).
 *
 * Set env var NEXT_PUBLIC_SITE_URL setelah domain/deployment Vercel final
 * ditentukan. Sebelum itu, fallback ke localhost supaya build tetap jalan.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
