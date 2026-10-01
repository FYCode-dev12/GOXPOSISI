import type { MetadataRoute } from "next";

export const revalidate = 3600; // 1 hour — book/article list changes on publish

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { getAllBooksWithBackgrounds, getAllBooksWithContent } = await import("@/lib/content");
  const [books, backgroundBooks] = await Promise.all([getAllBooksWithContent(), getAllBooksWithBackgrounds()]);

  const bookRoutes: MetadataRoute.Sitemap = [];
  const articleRoutes: MetadataRoute.Sitemap = [];

  for (const book of books) {
    bookRoutes.push({
      url: `https://www.gosposisi.web.id/kitab/${book.slug}`,
      lastModified: book.meta ? new Date() : undefined,
      changeFrequency: "monthly",
      priority: 0.6,
    });
    for (const pasal of book.availablePasal) {
      articleRoutes.push({
        url: `https://www.gosposisi.web.id/kitab/${book.slug}/${pasal}`,
        lastModified: book.meta ? new Date() : undefined,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  const backgroundRoutes: MetadataRoute.Sitemap = backgroundBooks.map((book) => ({
    url: `https://www.gosposisi.web.id/latar-belakang/${book.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    {
      url: "https://www.gosposisi.web.id",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://www.gosposisi.web.id/tema",
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: "https://www.gosposisi.web.id/disclaimer",
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...bookRoutes,
    ...articleRoutes,
    ...backgroundRoutes,
  ];
}
