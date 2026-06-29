import { notFound } from "next/navigation"
import { CmsBlockRenderer } from "@/components/cms/CmsRenderer"
import { readCmsPageVariants } from "@/lib/cms"
import { parseDemoState, resolvePageBlocks, resolveBlockData } from "@/lib/demo/demo-state"

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
  const page = readCmsPageVariants(slug)

  if (!page || page.variants.length === 0) {
    notFound()
  }

  const blocks = resolvePageBlocks(page, state.layout)
  const resolvedBlocks = blocks.map((block, idx) => {
    const resolved = state.text ? resolveBlockData(block, state.text) : block
    return <CmsBlockRenderer key={`${resolved.type}-${idx}`} block={resolved} />
  })

  return <>{resolvedBlocks}</>
}
