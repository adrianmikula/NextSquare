import Link from "next/link"
import type { SiteProfile } from "@/lib/cms"
import type { CmsBlock } from "@/lib/cms"
import { CmsBlockRenderer } from "@/components/cms/CmsRenderer"

const FALLBACK_NAME = "Cafe Template"

export function Footer({ siteProfile, blocks }: { siteProfile?: SiteProfile | null; blocks?: CmsBlock[] }) {
  const year = new Date().getFullYear()
  const name = siteProfile?.siteName || FALLBACK_NAME
  const tagline = siteProfile?.tagline || "Fresh coffee, great food, good vibes."
  const hasBlocks = blocks && blocks.length > 0

  const renderBlock = (block: CmsBlock, idx: number) => (
    <CmsBlockRenderer key={`${block.type}-${idx}`} block={block} />
  )

  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {hasBlocks ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {blocks!.map(renderBlock)}
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-500">
                {name}
              </h3>
              <p className="text-sm text-stone-600">{tagline}</p>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-500">
                Links
              </h3>
              <nav className="flex flex-col gap-2">
                <Link
                  href="/menu"
                  className="text-sm text-stone-600 hover:text-amber-700"
                >
                  Menu
                </Link>
                <Link
                  href="/about"
                  className="text-sm text-stone-600 hover:text-amber-700"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-sm text-stone-600 hover:text-amber-700"
                >
                  Contact
                </Link>
              </nav>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-500">
                Follow Us
              </h3>
              <p className="text-sm text-stone-600">Instagram: {siteProfile?.social?.instagram || "@cafetemplate"}</p>
              <p className="text-sm text-stone-600">{siteProfile?.contact?.email || "hello@cafetemplate.com"}</p>
            </div>
          </div>
        )}

        {!hasBlocks && (
          <div className="mt-8 border-t border-stone-200 pt-6 text-center text-xs text-stone-400">
            &copy; {year} {name}. Built with Next.js &amp; Square.
          </div>
        )}
      </div>
    </footer>
  )
}
