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
import { ThemeProvider } from "@/components/cms/ThemeProvider"
import { ToastContainer } from "@/components/ui/toast"
import { requireEnv } from "@/lib/env"
import { readSiteProfile, readCmsPageVariants } from "@/lib/cms"
import { parseDemoState, resolvePageBlocks, dimensionStateToDemoState } from "@/lib/demo/demo-state"
import { parseDimensionState, resolveDimensionSpecs, compileSpecsToCssVars, getAllBundleConfigs, loadAllSpecData } from "@/lib/dimensions"
import { safeSearchParams } from "@/lib/utils"
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

  const sp = await searchParams
  const searchQuery = safeSearchParams(sp)

  const state = parseDemoState(searchQuery)
  const dimState = parseDimensionState(searchQuery)
  const legacyState = dimensionStateToDemoState(dimState)
  const layoutVariant = state.layout ?? legacyState.layout ?? "A"

  const headerBlocks: CmsBlock[] = headerPage ? resolvePageBlocks(headerPage, layoutVariant) : []
  const footerBlocks: CmsBlock[] = footerPage ? resolvePageBlocks(footerPage, layoutVariant) : []

  const dimSpecs = resolveDimensionSpecs(dimState)
  const cssVars = compileSpecsToCssVars(dimSpecs)
  const cssVarsStyle = Object.entries(cssVars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";")

  const bundles = getAllBundleConfigs()
  const allSpecData = loadAllSpecData()

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider cssVars={cssVars}>
          <style
            dangerouslySetInnerHTML={{
              __html: `:root{${cssVarsStyle}}`,
            }}
          />
          <ToastProvider>
            <Header siteProfile={siteProfile} blocks={headerBlocks} />
            <main className="flex-1">{children}</main>
            <Footer siteProfile={siteProfile} blocks={footerBlocks} />
          </ToastProvider>
        </ThemeProvider>
        <ToastContainer />
        <DemoBadge />
        <ClientThemeSync bundles={bundles} specData={allSpecData} />
        <DemoModePopup bundles={bundles} />
        <CartDrawer />
      </body>
    </html>
  )
}
