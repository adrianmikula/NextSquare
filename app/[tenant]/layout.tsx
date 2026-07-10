import { ThemeProvider } from "@/components/cms/ThemeProvider"
import { readTheme, toCssVars, ACTIVE_THEME_VARIANT } from "@/lib/cms"
import { parseDimensionState, resolveDimensionSpecs, compileSpecsToCssVars } from "@/lib/dimensions"
import { safeSearchParams } from "@/lib/utils"

export default async function TenantLayout({
  children,
  searchParams,
}: {
  children: React.ReactNode
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const searchQuery = safeSearchParams(sp)

  const hasDimensionParams = searchQuery.has("bundle") || 
    ["spatial", "color", "typography", "wording", "imagery", "components", "rhythm", "motion"]
      .some((k) => searchQuery.has(k))

  let cssVars: Record<string, string> | undefined

  if (hasDimensionParams) {
    const dimState = parseDimensionState(searchQuery)
    const dimSpecs = resolveDimensionSpecs(dimState)
    cssVars = compileSpecsToCssVars(dimSpecs)
  } else {
    const theme = readTheme(ACTIVE_THEME_VARIANT)
    cssVars = theme ? toCssVars(theme, ACTIVE_THEME_VARIANT) : undefined
  }

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
