import { notFound } from "next/navigation"
import { CmsBlockRenderer } from "@/components/cms/CmsRenderer"
import { readCmsPages } from "@/lib/cms"

interface TenantPageProps {
  params: Promise<{ tenant: string }>
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { tenant } = await params
  const pages = readCmsPages(tenant)
  const home = pages.find((p) => p.slug === "home")

  if (!home) {
    notFound()
  }

  return (
    <>
      {home.blocks.map((block, idx) => (
        <CmsBlockRenderer key={`${block.type}-${idx}`} block={block} />
      ))}
    </>
  )
}
