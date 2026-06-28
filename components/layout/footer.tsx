import Link from "next/link"
import type { SiteProfile } from "@/lib/cms"

const FALLBACK_NAME = "Cafe Template"

export function Footer({ siteProfile }: { siteProfile?: SiteProfile | null }) {
  const year = new Date().getFullYear()
  const name = siteProfile?.siteName || FALLBACK_NAME
  const tagline = siteProfile?.tagline || "Fresh coffee, great food, good vibes."
  const instagram = siteProfile?.social?.instagram || "@cafetemplate"
  const email = siteProfile?.contact?.email || "hello@cafetemplate.com"

  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
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
            <p className="text-sm text-stone-600">Instagram: {instagram}</p>
            <p className="text-sm text-stone-600">{email}</p>
          </div>
        </div>

        <div className="mt-8 border-t border-stone-200 pt-6 text-center text-xs text-stone-400">
          &copy; {year} {name}. Built with Next.js &amp; Square.
        </div>
      </div>
    </footer>
  )
}
