import { ThemeProvider } from "@/components/cms/ThemeProvider"
import { readTheme, toCssVars, getActiveTenant, getActiveThemeVariant } from "@/lib/cms"

interface TenantLayoutProps {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { tenant } = await params
  const activeTenant = getActiveTenant()
  const themeVariant = getActiveThemeVariant()
  const theme = readTheme(activeTenant, themeVariant)
  const cssVars = theme ? toCssVars(theme, themeVariant) : undefined

  const cssVarsStyle = cssVars
    ? Object.entries(cssVars)
        .map(([k, v]) => `${k}:${v}`)
        .join(";")
    : ""

  return (
    <ThemeProvider tenant={activeTenant} cssVars={cssVars}>
      <style
        dangerouslySetInnerHTML={{
          __html: `:root{${cssVarsStyle}}`,
        }}
      />
      {children}
    </ThemeProvider>
  )
}