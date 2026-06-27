export interface CmsImage {
  url?: string
  alt?: string
  srcset?: string
  width?: number
  height?: number
}

export interface CmsPage {
  id: string
  title: string
  slug: string
  htmlContent?: string
  excerpt?: string
  image?: CmsImage
  seoTitle?: string
  seoDescription?: string
  updatedAt?: string
}

export interface CmsMenuItem {
  id: string
  label: string
  href: string
  order: number
}

export interface CmsBlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  htmlContent?: string
  author?: string
  publishedAt?: string
  image?: CmsImage
  seoTitle?: string
  seoDescription?: string
}

export interface CmsAdapter {
  listPages(): Promise<CmsPage[]>
  getPage(slug: string, previewToken?: string): Promise<CmsPage | null>
  listMenuItems(): Promise<CmsMenuItem[]>
  listBlogPosts(limit?: number, previewToken?: string): Promise<CmsBlogPost[]>
}

export type CmsProvider = "outstatic" | "wordpress"
