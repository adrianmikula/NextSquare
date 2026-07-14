import { notFound } from "next/navigation"
import { CmsBlockRenderer } from "@/components/cms/CmsRenderer"
import { readCmsPageVariants, resolvePageLayoutCssVars } from "@/lib/cms"
import { parseDemoState, resolvePageBlocks, resolveBlockData } from "@/lib/demo/demo-state"
import { parseDimensionState, resolveDimensionSpecs } from "@/lib/dimensions"
import { extractComponentOverrides } from "@/lib/component-registry"
import type { ComponentOverrides } from "@/lib/component-registry"

interface SlugPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ theme?: string; layout?: string; text?: string }>
}

export default async function SlugPage({ params, searchParams }: SlugPageProps) {
  const { slug } = await params
  const sp = await searchParams
  const state = parseDemoState(new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v != null).map(([k, v]) => `${k}=${v}`).join("&")
  ))

  const dimState = parseDimensionState(new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v != null).map(([k, v]) => `${k}=${v}`).join("&")
  ))
  const dimSpecs = resolveDimensionSpecs(dimState)
  const componentOverrides: ComponentOverrides | undefined = extractComponentOverrides(dimSpecs)

  const page = readCmsPageVariants(slug)
  const layoutPage = readCmsPageVariants("page-layout")

  if (!page || page.variants.length === 0) {
    notFound()
  }

  const blocks = resolvePageBlocks(page, state.layout)
  const layoutCssVars = resolvePageLayoutCssVars(layoutPage, state.layout)
  const contentBlocks = blocks.filter((b) => b.type !== "page-layout")
  const resolvedBlocks = contentBlocks.map((block, idx) => {
    const resolved = resolveBlockData(block, state.text || "A")
    return <CmsBlockRenderer key={`${resolved.type}-${idx}`} block={resolved} componentOverrides={componentOverrides} />
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
