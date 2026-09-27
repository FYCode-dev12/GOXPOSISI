import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/admin/", "/disclaimer"],
    },
    sitemap: "https://www.gosposisi.web.id/sitemap.xml",
  };
}
