import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCmsAdapter } from "@/lib/cms/adapter"
import DOMPurify from "dompurify"
import Link from "next/link"

type Props = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ preview?: string; token?: string }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const sp = searchParams ? await searchParams : undefined
  const isPreview = sp?.preview === "true"
  const previewToken = isPreview ? sp?.token : undefined

  const adapter = getCmsAdapter()
  const post = await adapter.listBlogPosts(undefined, previewToken).then((posts) =>
    posts.find((p) => p.slug === slug)
  )

  if (!post) {
    return { title: "Post Not Found" }
  }

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? "",
  }
}

export default async function BlogPostPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = searchParams ? await searchParams : undefined
  const isPreview = sp?.preview === "true"
  const previewToken = isPreview ? sp?.token : undefined

  const adapter = getCmsAdapter()
  const posts = await adapter.listBlogPosts(undefined, previewToken)
  const post = posts.find((p) => p.slug === slug)

  if (!post) {
    notFound()
  }

  const content = post.htmlContent
    ? DOMPurify.sanitize(post.htmlContent)
    : ""

  return (
    <div className="bg-white py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link
          href="/blog"
          className="text-sm font-medium text-amber-700 hover:text-amber-800"
        >
          ← Back to Blog
        </Link>

        {post.image?.url && (
          <div className="mt-6 aspect-[16/9] overflow-hidden rounded-xl bg-stone-100">
            <img
              src={post.image.url}
              alt={post.image.alt ?? post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <h1 className="mt-8 text-4xl font-bold tracking-tight text-stone-900">
          {post.title}
        </h1>

        <div className="mt-4 flex items-center gap-4 text-sm text-stone-500">
          {post.author && <span>By {post.author}</span>}
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-AU", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
        </div>

        {content && (
          <div
            className="prose prose-stone mt-10 max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}

        {!content && post.excerpt && (
          <p className="mt-10 text-stone-600">{post.excerpt}</p>
        )}
      </div>
    </div>
  )
}
