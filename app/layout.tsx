import type { Metadata } from "next"
import {
  Inter,
  Nunito,
  Playfair_Display,
  Lora,
  DM_Sans,
  Fraunces,
  Space_Grotesk,
  Instrument_Sans,
} from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { ToastProvider } from "@/components/ui/ToastProvider"
import { DemoBadge } from "@/components/demo/DemoBadge"

import { ThemeProvider } from "@/components/cms/ThemeProvider"
import { ToastContainer } from "@/components/ui/toast"
import { requireEnv } from "@/lib/env"
import { readSiteProfile, readCmsPageVariants } from "@/lib/cms"
import { resolvePageBlocks } from "@/lib/demo/demo-state"
import { defaultDimensionState, resolveDimensionSpecs, compileSpecsToCssVars, getAllBundleConfigs } from "@/lib/dimensions"
import { extractComponentOverrides } from "@/lib/component-registry"
import type { CmsBlock } from "@/lib/cms"
import type { ComponentOverrides } from "@/lib/component-registry"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" })
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" })
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" })
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans" })

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
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteProfile = readSiteProfile()
  const headerPage = readCmsPageVariants("header")
  const footerPage = readCmsPageVariants("footer")

  const rawBundle = process.env.NEXT_PUBLIC_THEME_BUNDLE
  if (!rawBundle) {
    console.warn("[theme] NEXT_PUBLIC_THEME_BUNDLE is not set — defaulting to bundle A")
  }
  const bundleId = (rawBundle || "A").toUpperCase()
  const bundles = getAllBundleConfigs()
  const activeBundle = bundles.find((b) => b.id === bundleId)
  const dimState = activeBundle?.dimensions ?? defaultDimensionState()

  const headerBlocks: CmsBlock[] = headerPage ? resolvePageBlocks(headerPage, "A") : []
  const footerBlocks: CmsBlock[] = footerPage ? resolvePageBlocks(footerPage, "A") : []

  const dimSpecs = resolveDimensionSpecs(dimState)
  const cssVars = compileSpecsToCssVars(dimSpecs)
  const cssVarsStyle = Object.entries(cssVars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";")
  const componentOverrides: ComponentOverrides | undefined = extractComponentOverrides(dimSpecs)

  return (
    <html lang="en">
      <body className={`${inter.className} ${inter.variable} ${nunito.variable} ${playfair.variable} ${lora.variable} ${dmSans.variable} ${fraunces.variable} ${spaceGrotesk.variable} ${instrumentSans.variable}`}>
        <ThemeProvider cssVars={cssVars}>
          <style
            dangerouslySetInnerHTML={{
              __html: `:root{${cssVarsStyle}}`,
            }}
          />
          <ToastProvider>
            <Header siteProfile={siteProfile} blocks={headerBlocks} componentOverrides={componentOverrides} />
            <main className="flex-1">{children}</main>
            <Footer siteProfile={siteProfile} blocks={footerBlocks} componentOverrides={componentOverrides} />
          </ToastProvider>
        </ThemeProvider>
        <ToastContainer />
        <DemoBadge />
        <CartDrawer />
      </body>
    </html>
  )
}
