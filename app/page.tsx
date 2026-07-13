import { notFound } from "next/navigation"
import { CmsBlockRenderer } from "@/components/cms/CmsRenderer"
import { readCmsPageVariants, resolvePageLayoutCssVars } from "@/lib/cms"
import { parseDemoState, resolvePageBlocks, resolveBlockData, dimensionStateToDemoState } from "@/lib/demo/demo-state"
import { parseDimensionState } from "@/lib/dimensions"
import { safeSearchParams } from "@/lib/utils"

interface PageProps {
  searchParams: Promise<{ theme?: string; layout?: string; text?: string; bundle?: string; spatial?: string; wording?: string }>
}

export default async function RootHomePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const searchQuery = safeSearchParams(sp)

  const state = parseDemoState(searchQuery)
  const dimState = parseDimensionState(searchQuery)
  const legacyState = dimensionStateToDemoState(dimState)

  const page = readCmsPageVariants("home")
  const layoutPage = readCmsPageVariants("page-layout")

  if (!page || page.variants.length === 0) {
    notFound()
  }

  const layoutVariant = state.layout ?? legacyState.layout ?? "A"
  const textVariant = state.text ?? legacyState.text ?? "A"

  const blocks = resolvePageBlocks(page, layoutVariant)
  const layoutCssVars = resolvePageLayoutCssVars(layoutPage, layoutVariant)
  const contentBlocks = blocks.filter((b) => b.type !== "page-layout")
  const resolvedBlocks = contentBlocks.map((block, idx) => {
    const resolved = resolveBlockData(block, textVariant)
    return <CmsBlockRenderer key={`${resolved.type}-${idx}`} block={resolved} />
  })

  return (
    <>
      {layoutCssVars && (
        <style dangerouslySetInnerHTML={{ __html: `:root{${layoutCssVars}}` }} />
      )}
      {resolvedBlocks}
    </>
  )
}
