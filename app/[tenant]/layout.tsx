import { ThemeProvider } from "@/components/cms/ThemeProvider"
import { readTheme, toCssVars, ACTIVE_THEME_VARIANT } from "@/lib/cms"

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const theme = readTheme(ACTIVE_THEME_VARIANT)
  const cssVars = theme ? toCssVars(theme, ACTIVE_THEME_VARIANT) : undefined

  const cssVarsStyle = cssVars
    ? Object.entries(cssVars)
        .map(([k, v]) => `${k}:${v}`)
        .join(";")
    : ""

  return (
    <ThemeProvider cssVars={cssVars}>
      <style
        dangerouslySetInnerHTML={{
          __html: `:root{${cssVarsStyle}}`,
        }}
      />
      {children}
    </ThemeProvider>
  )
}
