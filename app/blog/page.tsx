import type { Metadata } from "next"
import { getCmsAdapter } from "@/lib/cms/adapter"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Blog",
  description: "Latest news and stories from the cafe.",
}

interface BlogPageProps {
  searchParams?: Promise<{ preview?: string; token?: string }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = searchParams ? await searchParams : undefined
  const isPreview = params?.preview === "true"
  const previewToken = isPreview ? params?.token : undefined

  const adapter = getCmsAdapter()
  const posts = await adapter.listBlogPosts(undefined, previewToken)

  return (
    <div className="bg-stone-50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900">
            From the Blog
          </h1>
          <p className="mt-4 text-lg text-stone-600">
            Latest news and stories from the cafe.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.length === 0 ? (
            <p className="col-span-full text-center text-stone-600">
              No blog posts yet. Check back soon!
            </p>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-xl border border-stone-200 bg-white"
              >
                {post.image?.url && (
                  <div className="aspect-[16/9] overflow-hidden bg-stone-100">
                    <img
                      src={post.image.url}
                      alt={post.image.alt ?? post.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-stone-900">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-amber-700"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt && (
                    <p className="mt-3 line-clamp-3 text-stone-600">
                      {post.excerpt}
                    </p>
                  )}
                  {post.publishedAt && (
                    <time className="mt-4 block text-sm text-stone-500">
                      {new Date(post.publishedAt).toLocaleDateString("en-AU", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
