import type { MetadataRoute } from "next";

// Allow crawling of the public marketing/auth pages; keep the app + API out of the index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/landing", "/login", "/signup", "/blog", "/privacy", "/terms"],
      disallow: ["/api/", "/buildings", "/work-orders", "/housekeeping", "/settings", "/reports", "/assets", "/messages", "/technicians", "/help", "/front-desk", "/property", "/auth/"],
    },
    sitemap: "https://roomward.app/sitemap.xml",
    host: "https://roomward.app",
  };
}
