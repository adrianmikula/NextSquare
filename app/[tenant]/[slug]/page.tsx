import { notFound } from "next/navigation"
import { CmsBlockRenderer } from "@/components/cms/CmsRenderer"
import { readCmsPages, getActiveTenant } from "@/lib/cms"

interface TenantSlugPageProps {
  params: Promise<{ tenant: string; slug: string }>
}

export default async function TenantSlugPage({ params }: TenantSlugPageProps) {
  const { tenant, slug } = await params
  const activeTenant = getActiveTenant()
  const pages = readCmsPages(activeTenant)
  const page = pages.find((p) => p.slug === slug)

  if (!page || page.blocks.length === 0) {
    notFound()
  }

  return (
    <>
      {page.blocks.map((block, idx) => (
        <CmsBlockRenderer key={`${block.type}-${idx}`} block={block} />
      ))}
    </>
  )
}
