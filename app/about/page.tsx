import { CmsBlockRenderer } from "@/components/cms/CmsRenderer"
import { notFound } from "next/navigation"
import { readCmsPages } from "@/lib/cms"

export default function AboutPage() {
  const pages = readCmsPages()
  const about = pages.find((p) => p.slug === "about")

  if (!about) {
    notFound()
  }

  return (
    <>
      {about.blocks.map((block, idx) => (
        <CmsBlockRenderer key={`${block.type}-${idx}`} block={block} />
      ))}
    </>
  )
}
