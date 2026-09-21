import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/cart",
        "/checkout",
        "/login",
        "/register",
        "/orders",
        "/candidate/",
        "/track-order",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
