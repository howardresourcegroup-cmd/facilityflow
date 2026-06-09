import type { MetadataRoute } from "next";

// Allow crawling of the public marketing/auth pages; keep the app + API out of the index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/signup", "/blog"],
      disallow: ["/api/", "/buildings", "/work-orders", "/housekeeping", "/settings", "/reports", "/assets", "/messages", "/technicians", "/help"],
    },
    sitemap: "https://roomward.app/sitemap.xml",
    host: "https://roomward.app",
  };
}
