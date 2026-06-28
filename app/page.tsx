import { readCmsPages } from "@/lib/cms"
import { CmsBlockRenderer } from "@/components/cms/CmsRenderer"

export const dynamic = "force-dynamic"

export default function Home() {
  const pages = readCmsPages("aydins-cafe")
  const home = pages.find((p) => p.slug === "home")

  if (!home) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-center">
        <div>
          <h1 className="text-6xl font-bold text-stone-200">404</h1>
          <h2 className="mt-4 text-2xl font-semibold text-stone-900">Page not found</h2>
          <p className="mt-2 text-stone-600">CMS content is missing. Run the website-builder skill to generate pages.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {home.blocks.map((block, idx) => (
        <CmsBlockRenderer key={`${block.type}-${idx}`} block={block} />
      ))}
    </>
  )
}
