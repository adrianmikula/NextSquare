import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { ToastProvider } from "@/components/ui/ToastProvider"
import { DemoBadge } from "@/components/demo/DemoBadge"
import { ToastContainer } from "@/components/ui/toast"
import { requireEnv } from "@/lib/env"

const inter = Inter({ subsets: ["latin"] })

const siteTitle = "Cafe Template"
const siteDescription =
  "Fresh coffee, great food, and a warm atmosphere. Order online for pickup or delivery."

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  metadataBase: new URL(requireEnv("NEXT_PUBLIC_SITE_URL")),
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ToastProvider>
        <ToastContainer />
        <DemoBadge />
        <CartDrawer />
      </body>
    </html>
  )
}
