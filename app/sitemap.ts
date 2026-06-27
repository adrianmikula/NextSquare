import type { MetadataRoute } from "next"
import { requireEnv } from "@/lib/env"
import { getCmsAdapter } from "@/lib/cms/adapter"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = requireEnv("NEXT_PUBLIC_SITE_URL")

  try {
    const adapter = getCmsAdapter()
    const posts = await adapter.listBlogPosts()

    const blogEntries = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))

    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
      { url: `${baseUrl}/menu`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
      ...blogEntries,
    ]
  } catch {
    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
      { url: `${baseUrl}/menu`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    ]
  }
}
