import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CmsBlockRenderer } from "@/components/cms/CmsRenderer"
import { readCmsPages } from "@/lib/cms"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with us. Find our location, hours, and contact information.",
}

export default function ContactPage() {
  const pages = readCmsPages()
  const contact = pages.find((p) => p.slug === "contact")

  if (!contact) {
    notFound()
  }

  return (
    <div>
      {contact.blocks.map((block, idx) => (
        <CmsBlockRenderer key={`${block.type}-${idx}`} block={block} />
      ))}
    </div>
  )
}
