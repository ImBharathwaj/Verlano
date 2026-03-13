import type { MetadataRoute } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://verlano.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/account/", "/api/", "/login", "/signup", "/checkout/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
