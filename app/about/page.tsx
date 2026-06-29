import { notFound } from "next/navigation"
import { CmsBlockRenderer } from "@/components/cms/CmsRenderer"
import { readCmsPages, getActiveTenant } from "@/lib/cms"
import type { Metadata } from "next"

const tenant = getActiveTenant()
const aboutCms = readCmsPages(tenant).find((p) => p.slug === "about")

export const metadata: Metadata = {
  title: "About",
  description: "Learn about our story, our values, and what makes our cafe special.",
}

export default function AboutPage() {
  if (!aboutCms || aboutCms.blocks.length === 0) {
    return notFound()
  }

  return (
    <div>
      {aboutCms.blocks.map((block, idx) => (
        <CmsBlockRenderer key={`${block.type}-${idx}`} block={block} />
      ))}
    </div>
  )
}