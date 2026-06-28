import { ThemeProvider } from "@/components/cms/ThemeProvider"
import { readTheme, toCssVars } from "@/lib/cms"

interface TenantLayoutProps {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { tenant } = await params
  const theme = readTheme(tenant, "a")
  const cssVars = theme ? toCssVars(theme) : undefined

  return (
    <ThemeProvider tenant={tenant} cssVars={cssVars}>
      {children}
    </ThemeProvider>
  )
}
