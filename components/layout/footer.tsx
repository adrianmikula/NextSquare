import Link from "next/link"
import type { SiteProfile } from "@/lib/cms"
import type { CmsBlock } from "@/lib/cms"
import { CmsBlockRenderer } from "@/components/cms/CmsRenderer"
import { FALLBACK_NAME, DEFAULT_LINKS } from "@/lib/constants"

export function Footer({ siteProfile, blocks }: { siteProfile?: SiteProfile | null; blocks?: CmsBlock[] }) {
  const year = new Date().getFullYear()
  const name = siteProfile?.siteName || FALLBACK_NAME
  const tagline = siteProfile?.tagline || "Fresh coffee, great food, good vibes."
  const hasBlocks = blocks && blocks.length > 0

  const renderBlock = (block: CmsBlock, idx: number) => (
    <CmsBlockRenderer key={`${block.type}-${idx}`} block={block} />
  )

  return (
    <footer className="footer border-t border-card bg-footer">
      <div className="mx-auto container-max px-4 section-py sm:px-6">
        {hasBlocks ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4" style={{ gap: "var(--grid-gap)" }}>
            {blocks!.map(renderBlock)}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(var(--footer-grid, 3), 1fr)", gap: "var(--grid-gap)" }}>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-footer-heading">
                {name}
              </h3>
              <p className="text-sm text-footer-link">{tagline}</p>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-footer-heading">
                Links
              </h3>
              <nav className="flex flex-col gap-2">
                {DEFAULT_LINKS.filter((l) => l.href !== "/").map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-footer-link hover-text-footer-link-hover"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-footer-heading">
                Follow Us
              </h3>
              <p className="text-sm text-footer-link">Instagram: {siteProfile?.social?.instagram || "@cafetemplate"}</p>
              <p className="text-sm text-footer-link">{siteProfile?.contact?.email || "hello@cafetemplate.com"}</p>
            </div>
          </div>
        )}

        {!hasBlocks && (
          <div className="mt-8 border-card pt-6 text-xs text-footer-muted" style={{ borderTopWidth: "var(--theme-border-width)", textAlign: "var(--footer-text-align, center)" as unknown as React.CSSProperties["textAlign"] }}>
            &copy; {year} {name}. Built with Next.js &amp; Square.
          </div>
        )}
      </div>
    </footer>
  )
}
