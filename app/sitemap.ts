import type { MetadataRoute } from "next"
import { requireEnv } from "@/lib/env"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = requireEnv("NEXT_PUBLIC_SITE_URL")

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/menu`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ]
}
