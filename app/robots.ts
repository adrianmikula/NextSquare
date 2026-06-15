import type { MetadataRoute } from "next"
import { requireEnv } from "@/lib/env"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/outstatic/",
    },
    sitemap: `${requireEnv("NEXT_PUBLIC_SITE_URL")}/sitemap.xml`,
  }
}
