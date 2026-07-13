import Link from "next/link"
import { OrderButton } from "@/components/order-button"
import { CartButton } from "@/components/cart/CartButton"
import { MobileMenuClient } from "./mobile-menu"
import { Suspense } from "react"
import type { SiteProfile } from "@/lib/cms"
import type { CmsBlock } from "@/lib/cms"
import { CmsBlockRenderer } from "@/components/cms/CmsRenderer"

const FALLBACK_NAME = "Cafe Template"

const DEFAULT_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function Header({ siteProfile, blocks }: { siteProfile?: SiteProfile | null; blocks?: CmsBlock[] }) {
  const name = siteProfile?.siteName || FALLBACK_NAME
  const hasBlocks = blocks && blocks.length > 0

  const renderBlock = (block: CmsBlock, idx: number) => (
    <CmsBlockRenderer key={`${block.type}-${idx}`} block={block} />
  )

  return (
    <header
      className="top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-white/60"
      style={{
        position: "var(--header-style, sticky)" as any,
        height: "var(--nav-height, 5rem)",
        borderBottom: "var(--theme-border-width, 1px) solid var(--color-stone-200)",
        backgroundColor: `rgba(255,255,255, var(--nav-bg-opacity, 0.95))`,
      }}
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
              className="text-xl font-bold tracking-tight text-stone-900"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span className="text-amber-600">☕</span> {name}
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              {DEFAULT_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-stone-600 transition-colors hover:text-amber-700"
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

