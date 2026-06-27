"server-only"

import type { CmsAdapter, CmsPage, CmsMenuItem, CmsBlogPost } from "@/types/cms"

interface WordPressConfig {
  url: string
  previewSecret?: string
  previewUsername?: string
  previewPassword?: string
}

interface WpGraphQlResponse<T> {
  data?: {
    pages?: { nodes: T[] }
    posts?: { nodes: T[] }
    page?: T
    post?: T
    mediaItem?: {
      sourceUrl?: string
      altText?: string
      srcset?: string
      mediaDetails?: { width?: number; height?: number }
    }
  }
  errors?: Array<{ message: string }>
}

function buildBasicAuth(username?: string, password?: string): string | undefined {
  if (!username || !password) return undefined
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`
}

export class WordPressCmsAdapter implements CmsAdapter {
  private readonly previewSecret?: string
  private readonly previewCredentials?: string

  constructor(private config: WordPressConfig) {
    this.previewSecret = config.previewSecret
    this.previewCredentials = buildBasicAuth(
      config.previewUsername,
      config.previewPassword
    )
  }

  private async wpFetch<T>(
    query: string,
    variables?: Record<string, unknown>,
    isPreview = false
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (isPreview && this.previewCredentials) {
      headers["Authorization"] = this.previewCredentials
    }

    const body = variables ? JSON.stringify({ query, variables }) : JSON.stringify({ query })

    const res = await fetch(this.config.url, {
      method: "POST",
      headers,
      body,
      next: { revalidate: 300, tags: ["cms-wordpress"] },
    })

    if (!res.ok) {
      throw new Error(`WordPress GraphQL error: ${res.status}`)
    }

    const json = (await res.json()) as WpGraphQlResponse<T>
    if (json.errors && json.errors.length > 0) {
      throw new Error(`WordPress GraphQL error: ${json.errors[0].message}`)
    }
    return json.data as T
  }

  private isPreviewRequest(userToken?: string): boolean {
    return !!this.previewSecret && userToken === this.previewSecret
  }

  private mapWpPage(node: Record<string, unknown>): CmsPage {
    const featuredImage = node.featuredImage as Record<string, unknown> | undefined
    const seo = node.seo as Record<string, unknown> | undefined
    return {
      id: String(node.id ?? node.slug ?? Math.random()),
      title: String(node.title ?? ""),
      slug: String(node.uri ?? node.slug ?? "").replace(/^\/+|\/+$/g, ""),
      htmlContent: node.content ? String(node.content) : undefined,
      excerpt: node.excerpt ? String(node.excerpt) : undefined,
      image: featuredImage?.node
        ? {
            url: String((featuredImage.node as Record<string, string>).sourceUrl ?? ""),
            alt: String(featuredImage.node.altText ?? ""),
            srcset: featuredImage.node.srcset ? String(featuredImage.node.srcset) : undefined,
            width: (featuredImage.node as Record<string, number>).width,
            height: (featuredImage.node as Record<string, number>).height,
          }
        : undefined,
      seoTitle: seo?.title ? String(seo.title) : undefined,
      seoDescription: seo?.metaDesc ? String(seo.metaDesc) : undefined,
      updatedAt: node.date ? String(node.date) : undefined,
    }
  }

  private mapWpPost(node: Record<string, unknown>): CmsBlogPost {
    const featuredImage = node.featuredImage as Record<string, unknown> | undefined
    const seo = node.seo as Record<string, unknown> | undefined
    const author = node.author as Record<string, { node?: Record<string, string> }> | undefined
    return {
      id: String(node.id ?? node.slug ?? Math.random()),
      title: String(node.title ?? ""),
      slug: String(node.slug ?? ""),
      excerpt: node.excerpt ? String(node.excerpt) : undefined,
      htmlContent: node.content ? String(node.content) : undefined,
      author: author?.node?.name,
      publishedAt: node.date ? String(node.date) : undefined,
      image: featuredImage?.node
        ? {
            url: String((featuredImage.node as Record<string, string>).sourceUrl ?? ""),
            alt: String(featuredImage.node.altText ?? ""),
            srcset: featuredImage.node.srcset ? String(featuredImage.node.srcset) : undefined,
            width: (featuredImage.node as Record<string, number>).width,
            height: (featuredImage.node as Record<string, number>).height,
          }
        : undefined,
      seoTitle: seo?.title ? String(seo.title) : undefined,
      seoDescription: seo?.metaDesc ? String(seo.metaDesc) : undefined,
    }
  }

  async listPages(): Promise<CmsPage[]> {
    const query = `
      query ListPages {
        pages(first: 100) {
          nodes {
            id
            title
            uri
            slug
            content
            excerpt
            date
            featuredImage {
              node {
                sourceUrl
                altText
                srcset
                width
                height
              }
            }
            seo {
              title
              metaDesc
            }
          }
        }
      }
    `
    const data = await this.wpFetch<{ pages: { nodes: unknown[] } }>(query)
    return data.pages.nodes.map((n) => this.mapWpPage(n as Record<string, unknown>))
  }

  async getPage(slug: string, previewToken?: string): Promise<CmsPage | null> {
    const normalizedSlug = slug.startsWith("/")
      ? slug
      : `/${slug.replace(/^\/+/, "")}`

    const query = `
      query GetPage($uri: String!) {
        page(id: $uri, idType: URI) {
          id
          title
          uri
          slug
          content
          excerpt
          date
          featuredImage {
            node {
              sourceUrl
              altText
              srcset
              width
              height
            }
          }
          seo {
            title
            metaDesc
          }
        }
      }
    `

    try {
      const isPreview = this.isPreviewRequest(previewToken)
      const data = await this.wpFetch<{ page: Record<string, unknown> }>(query, { uri: normalizedSlug }, isPreview)
      if (!data.page) return null
      return this.mapWpPage(data.page)
    } catch {
      return null
    }
  }

  async listMenuItems(): Promise<CmsMenuItem[]> {
    return []
  }

  async listBlogPosts(limit = 10, previewToken?: string): Promise<CmsBlogPost[]> {
    const query = `
      query ListPosts($first: Int!) {
        posts(first: $first) {
          nodes {
            id
            title
            slug
            excerpt
            content
            date
            author {
              node {
                name
              }
            }
            featuredImage {
              node {
                sourceUrl
                altText
                srcset
                width
                height
              }
            }
            seo {
              title
              metaDesc
            }
          }
        }
      }
    `
    const isPreview = this.isPreviewRequest(previewToken)
    const data = await this.wpFetch<{ posts: { nodes: unknown[] } }>(query, { first: limit }, isPreview)
    return data.posts.nodes.map((n) => this.mapWpPost(n as Record<string, unknown>))
  }
}
