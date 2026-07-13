import { ThemeProvider } from "@/components/cms/ThemeProvider"
import { readTheme, toCssVars, ACTIVE_THEME_VARIANT } from "@/lib/cms"
import { defaultDimensionState, resolveDimensionSpecs, compileSpecsToCssVars, getAllBundleConfigs } from "@/lib/dimensions"

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const bundleId = (process.env.NEXT_PUBLIC_THEME_BUNDLE || "A").toUpperCase()
  const bundles = getAllBundleConfigs()
  const activeBundle = bundles.find((b) => b.id === bundleId)
  const dimState = activeBundle?.dimensions ?? defaultDimensionState()
  const dimSpecs = resolveDimensionSpecs(dimState)
  const cssVars = compileSpecsToCssVars(dimSpecs)

  const cssVarsStyle = Object.entries(cssVars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";")

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
