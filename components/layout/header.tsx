import Link from "next/link"
import { OrderButton } from "@/components/order-button"
import { CartButton } from "@/components/cart/CartButton"
import { MobileMenuClient } from "./mobile-menu"
import { Suspense } from "react"
import type { SiteProfile } from "@/lib/cms"

const FALLBACK_NAME = "Cafe Template"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function Header({ siteProfile }: { siteProfile?: SiteProfile | null }) {
  const name = siteProfile?.siteName || FALLBACK_NAME

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-stone-900"
        >
          <span className="text-amber-600">☕</span> {name}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-stone-600 transition-colors hover:text-amber-700"
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
      </div>
    </header>
  )
}

