import Link from "next/link"
import { OrderButton } from "@/components/order-button"
import { CartButton } from "@/components/cart/CartButton"
import { MobileMenuClient } from "./mobile-menu"
import { Suspense } from "react"
import type { SiteProfile } from "@/lib/cms"
import type { CmsBlock } from "@/lib/cms"
import { CmsBlockRenderer } from "@/components/cms/CmsRenderer"
import type { ComponentOverrides } from "@/lib/component-registry"
import { FALLBACK_NAME, DEFAULT_LINKS } from "@/lib/constants"

export function Header({ siteProfile, blocks, componentOverrides }: { siteProfile?: SiteProfile | null; blocks?: CmsBlock[]; componentOverrides?: ComponentOverrides }) {
  const name = siteProfile?.siteName || FALLBACK_NAME
  const hasBlocks = blocks && blocks.length > 0

  const renderBlock = (block: CmsBlock, idx: number) => (
    <CmsBlockRenderer key={`${block.type}-${idx}`} block={block} componentOverrides={componentOverrides} />
  )

  const headerStyle = {
    position: "var(--header-style, sticky)",
    height: "var(--nav-height, 5rem)",
    borderBottom: "var(--theme-border-width, 1px) solid var(--color-card-border)",
    backgroundColor: "var(--color-nav-bg)",
  } as unknown as React.CSSProperties & Record<string, string>

  return (
    <header
      className="navbar top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-nav"
      style={headerStyle}
    >
      <div
        className="flex items-center justify-between"
        style={{
          maxWidth: "var(--container-max, 72rem)",
          paddingLeft: "var(--section-px, 1rem)",
          paddingRight: "var(--section-px, 1rem)",
          marginLeft: "auto",
          marginRight: "auto",
          height: "100%",
        }}
      >
        {hasBlocks ? (
          blocks!.map(renderBlock)
        ) : (
          <>
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-heading"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span className="text-[var(--color-primary)]">☕</span> {name}
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              {DEFAULT_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-link transition-colors hover-text-link-hover"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {link.label}
                </Link>
              ))}
              <CartButton />
              <OrderButton />
            </nav>

            <Suspense fallback={<div className="flex items-center md:hidden"><CartButton /></div>}>
              <MobileMenuClient />
            </Suspense>
          </>
        )}
      </div>
    </header>
  )
}

