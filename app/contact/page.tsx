import type { Metadata } from "next"
import { CmsBlockRenderer } from "@/components/cms/CmsRenderer"
import { readCmsPages, getActiveTenant } from "@/lib/cms"

const tenant = getActiveTenant()
const contactCms = readCmsPages(tenant).find((p) => p.slug === "contact")

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with us. Find our location, hours, and contact information.",
}

export default function ContactPage() {
  if (!contactCms || contactCms.blocks.length === 0) {
    return notFound()
  }

  return (
    <div>
      {contactCms.blocks.map((block, idx) => (
        <CmsBlockRenderer key={`${block.type}-${idx}`} block={block} />
      ))}
    </div>
  )
}