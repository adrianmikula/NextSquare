import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { ToastProvider } from "@/components/ui/ToastProvider"
import { DemoBadge } from "@/components/demo/DemoBadge"
import { DemoModePopup } from "@/components/demo/DemoModePopup"
import { ClientThemeSync } from "@/components/demo/ClientThemeSync"
import { ToastContainer } from "@/components/ui/toast"
import { requireEnv } from "@/lib/env"
import { readSiteProfile, readCmsPageVariants } from "@/lib/cms"
import { parseDemoState, resolvePageBlocks } from "@/lib/demo/demo-state"
import type { CmsBlock } from "@/lib/cms"

const inter = Inter({ subsets: ["latin"] })

export async function generateMetadata(): Promise<Metadata> {
  const profile = readSiteProfile()
  const title = profile?.seo?.title || profile?.siteName || "Cafe Template"
  const description = profile?.seo?.description || profile?.description || ""

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    metadataBase: new URL(requireEnv("NEXT_PUBLIC_SITE_URL")),
    openGraph: {
      title,
      description,
      type: "website",
    },
  }
}

export default async function RootLayout({
  children,
  searchParams,
}: Readonly<{
  children: React.ReactNode
  searchParams: Promise<Record<string, string | string[] | undefined>>
}>) {
  const siteProfile = readSiteProfile()
  const headerPage = readCmsPageVariants("header")
  const footerPage = readCmsPageVariants("footer")
  const layoutPage = readCmsPageVariants("page-layout")

  const sp = await searchParams
  const state = parseDemoState(new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v != null).map(([k, v]) => `${k}=${Array.isArray(v) ? v[0] : v}`).join("&")
  ))

  const headerBlocks: CmsBlock[] = headerPage ? resolvePageBlocks(headerPage, state.layout) : []
  const footerBlocks: CmsBlock[] = footerPage ? resolvePageBlocks(footerPage, state.layout) : []

  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <Header siteProfile={siteProfile} blocks={headerBlocks} />
          <main className="flex-1">{children}</main>
          <Footer siteProfile={siteProfile} blocks={footerBlocks} />
        </ToastProvider>
        <ToastContainer />
        <DemoBadge />
        <ClientThemeSync />
        <DemoModePopup />
        <CartDrawer />
      </body>
    </html>
  )
}