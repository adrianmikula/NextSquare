"server-only"

import type { CmsAdapter, CmsPage, CmsMenuItem, CmsBlogPost } from "@/types/cms"

async function outstaticFetch(path: string) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  const url = new URL(`/api/outstatic${path}`, base)
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    next: { revalidate: 300 },
  })
  if (!res.ok) {
    throw new Error(`Outstatic API error: ${res.status}`)
  }
  return res.json()
}

function mapOutstaticPage(raw: Record<string, unknown>): CmsPage {
  const content = raw.content as string | undefined
  return {
    id: String(raw.slug ?? raw.id ?? Math.random()),
    title: String(raw.title ?? raw.slug ?? ""),
    slug: String(raw.slug ?? ""),
    htmlContent: content ?? "",
    excerpt: raw.description ? String(raw.description) : undefined,
    image: raw.coverImage
      ? {
          url: String((raw.coverImage as Record<string, string>).url ?? ""),
          alt: raw.title ? String(raw.title) : undefined,
        }
      : undefined,
    seoTitle: raw.seo?.title ? String(raw.seo.title) : undefined,
    seoDescription: raw.seo?.metaDesc ? String(raw.seo.metaDesc) : undefined,
    updatedAt: raw.publishedAt ? String(raw.publishedAt) : undefined,
  }
}

function mapOutstaticPost(raw: Record<string, unknown>): CmsBlogPost {
  const content = raw.content as string | undefined
  return {
    id: String(raw.slug ?? raw.id ?? Math.random()),
    title: String(raw.title ?? raw.slug ?? ""),
    slug: String(raw.slug ?? ""),
    excerpt: raw.description ? String(raw.description) : undefined,
    htmlContent: content ?? "",
    author: raw.author?.name ? String(raw.author.name) : undefined,
    publishedAt: raw.publishedAt ? String(raw.publishedAt) : undefined,
    image: raw.coverImage
      ? {
          url: String((raw.coverImage as Record<string, string>).url ?? ""),
          alt: raw.title ? String(raw.title) : undefined,
        }
      : undefined,
    seoTitle: raw.seo?.title ? String(raw.seo.title) : undefined,
    seoDescription: raw.seo?.metaDesc ? String(raw.seo.metaDesc) : undefined,
  }
}

export class OutstaticCmsAdapter implements CmsAdapter {
  async listPages(): Promise<CmsPage[]> {
    const data = await outstaticFetch("/content/pages")
    const items = Array.isArray(data) ? data : (data as { items?: unknown[] }).items ?? []
    return items.map(mapOutstaticPage)
  }

  async getPage(slug: string): Promise<CmsPage | null> {
    try {
      const data = await outstaticFetch(`/content/pages/${encodeURIComponent(slug)}`)
      return mapOutstaticPage(data as Record<string, unknown>)
    } catch {
      return null
    }
  }

  async listMenuItems(): Promise<CmsMenuItem[]> {
    return []
  }

  async listBlogPosts(limit = 10): Promise<CmsBlogPost[]> {
    const data = await outstaticFetch("/content/posts")
    const items = Array.isArray(data) ? data : (data as { items?: unknown[] }).items ?? []
    const mapped = items.map(mapOutstaticPost)
    return mapped.slice(0, limit)
  }
}
