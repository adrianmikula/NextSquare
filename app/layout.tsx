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
import { readSiteProfile } from "@/lib/cms"

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteProfile = readSiteProfile()

  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <Header siteProfile={siteProfile} />
          <main className="flex-1">{children}</main>
          <Footer siteProfile={siteProfile} />
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