import type { MetadataRoute } from "next";
import { getAllBooksWithContent } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const books = await getAllBooksWithContent();

  const bookRoutes: MetadataRoute.Sitemap = books.map((book) => ({
    url: `${SITE_URL}/kitab/${book.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const articleRoutes: MetadataRoute.Sitemap = books.flatMap((book) =>
    book.availablePasal.map((pasal) => ({
      url: `${SITE_URL}/kitab/${book.slug}/${pasal}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }))
  );

  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/tema`,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/disclaimer`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...bookRoutes,
    ...articleRoutes,
  ];
}
