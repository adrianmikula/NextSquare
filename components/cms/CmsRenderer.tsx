import Link from "next/link"
import { Star, Clock, MapPin, Coffee, Sandwich, GlassWater } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CmsBlock } from "@/lib/cms"

function IconRenderer({ name }: { name: string }) {
  const icons: Record<string, React.ElementType> = {
    Coffee,
    Sandwich,
    GlassWater,
    Clock,
    MapPin,
    Star,
  }
  const Icon = icons[name]
  if (!Icon) return null
  return <Icon className="h-6 w-6" />
}

export function CmsBlockRenderer({ block }: { block: CmsBlock }) {
  const { type, data } = block

  switch (type) {
    case "hero":
      return <CmsHero data={data as CmsBlock["data"] & { headline: string; subheadline: string; ctaLabel: string; ctaLink: string; image?: string }} />
    case "text":
      return <CmsText data={data as CmsBlock["data"] & { heading: string; body: string }} />
    case "products":
      return <CmsProducts data={data as CmsBlock["data"] & { title: string; items: Array<{ name: string; description: string; price?: number }> }} />
    case "testimonials":
      return <CmsTestimonials data={data as CmsBlock["data"] & { items: Array<{ author: string; text: string; source?: string }> }} />
    case "delivery":
      return <CmsDelivery data={data as CmsBlock["data"] & { heading: string; body: string; platforms: Array<{ name: string; url: string; label: string }> }} />
    case "hours":
      return <CmsHours data={data as CmsBlock["data"] & { schedule: Array<{ day: string; open: string; close: string }> }} />
    case "gallery":
      return <CmsGallery data={data as CmsBlock["data"] & { images: string[]; caption?: string }} />
    case "cta":
      return <CmsCta data={data as CmsBlock["data"] & { heading: string; subtext: string; buttonLabel: string; buttonLink: string }} />
    case "services":
      return <CmsServices data={data as CmsBlock["data"] & { title: string; items: Array<{ name: string; description: string; priceHint?: number; duration?: string }> }} />
    case "form":
      return <CmsForm data={data as CmsBlock["data"] & { title: string; fields: Array<{ name: string; type: string; label: string; required: boolean }> }} />
    case "faq":
      return <CmsFaq data={data as CmsBlock["data"] & { items: Array<{ question: string; answer: string }> }} />
    case "promo":
      return <CmsPromo data={data as CmsBlock["data"] & { heading: string; body: string; ctaLabel: string; ctaLink: string; image?: string }} />
    case "slideshow":
      return <CmsSlideshow data={data as CmsBlock["data"] & { images: string[]; caption?: string; interval?: number }} />
    case "social-icons":
      return <CmsSocialIcons data={data as CmsBlock["data"] & { platforms: Array<{ name: string; url: string; icon?: string }> }} />
    case "callout":
      return <CmsCallout data={data as CmsBlock["data"] & { quote: string; author?: string; role?: string } } />
    case "hr":
      return <CmsHR data={data as CmsBlock["data"] & { style?: "solid" | "dashed" | "dotted"; color?: string } } />
    case "image-text":
      return <CmsImageText data={data as CmsBlock["data"] & { items: Array<{ image?: string; heading: string; body: string; align?: "left" | "right" }> } } />
    case "comparison":
      return <CmsComparison data={data as CmsBlock["data"] & { title?: string; columns: Array<{ header: string; features: Array<{ name: string; included: boolean }> }>; ctaLabel?: string; ctaLink?: string } } />
    default:
      return null
  }
}

function sectionClass(bg: string) {
  return `${bg} section-py section-px`
}

function containerClass() {
  return "mx-auto container-max px-4 sm:px-6"
}

function cardClass(extra = "") {
  return cn(
    "card-themed rounded-xl border bg-white p-6",
    extra
  )
}

function headingClass(size: string = "3xl") {
  const sizes: Record<string, string> = {
    "4xl": "text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl",
    "3xl": "text-3xl font-bold tracking-tight sm:text-4xl",
    "2xl": "text-2xl font-bold",
    xl: "text-xl font-semibold",
  }
  return cn("text-stone-900", sizes[size] || sizes["3xl"])
}

function CmsHero({ data }: { data: Record<string, unknown> }) {
  const headline = String(data.headline || "")
  const subheadline = String(data.subheadline || "")
  const ctaLabel = String(data.ctaLebel || data.ctaLabel || "")
  const ctaLink = String(data.ctaLink || "/menu")
  const image = data.image as string | undefined
  const hasImage = image && !image.includes("placeholder")

  return (
    <section className={cn(sectionClass("relative overflow-hidden bg-stone-900"), "py-24 sm:py-32")}>
      {hasImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url('${image}')` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/70 to-stone-900" />
      )}
      <div className={cn(containerClass(), "relative text-center")}>
        <h1 className={headingClass("4xl") + " text-white"}>
          {headline}
        </h1>
        {subheadline && (
          <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-300">{subheadline}</p>
        )}
        {ctaLabel && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href={ctaLink} className={cn(buttonVariants({ size: "lg" }), "no-underline button-themed")}>
              {ctaLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

function CmsText({ data }: { data: Record<string, unknown> }) {
  const heading = String(data.heading || "")
  const body = String(data.body || "")
  return (
    <section className={sectionClass("bg-white")}>
      <div className={containerClass()}>
        {heading && <h2 className={cn(headingClass("3xl"), "mb-6")}>{heading}</h2>}
        <p className="text-lg text-stone-600 whitespace-pre-line">{body}</p>
      </div>
    </section>
  )
}

function CmsProducts({ data }: { data: Record<string, unknown> }) {
  const title = String(data.title || "")
  const items = (data.items as Array<{ name: string; description: string; price?: number }>) || []
  return (
    <section className={sectionClass("bg-white")}>
      <div className={containerClass()}>
        <div className="text-center">
          <h2 className={headingClass("3xl")}>{title}</h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3" style={{ gap: "var(--grid-gap)" }}>
          {items.map((item) => (
            <div key={item.name} className={cardClass()}>
              <h3 className="font-semibold text-stone-900 leading-none tracking-tight">{item.name}</h3>
              <p className="mt-2 text-sm text-stone-500">{item.description}</p>
              {item.price !== undefined && (
                <p className="mt-4 text-lg font-bold text-amber-700">${item.price.toFixed(2)}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CmsTestimonials({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as Array<{ author: string; text: string; source?: string }>) || []
  return (
    <section className={sectionClass("bg-stone-50")}>
      <div className={containerClass()}>
        <div className="text-center">
          <h2 className={headingClass("3xl")}>What Our Customers Say</h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3" style={{ gap: "var(--grid-gap)" }}>
          {items.map((item) => (
            <div key={item.author} className={cardClass()}>
              <div className="mb-3 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-stone-600">&ldquo;{item.text}&rdquo;</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs font-medium text-stone-500">— {item.author}</p>
                {item.source && <span className="text-xs text-stone-400">{item.source}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CmsDelivery({ data }: { data: Record<string, unknown> }) {
  const heading = String(data.heading || "")
  const body = String(data.body || "")
  const platforms = (data.platforms as Array<{ name: string; url: string; label: string }>) || []
  return (
    <section className={cn(sectionClass("bg-amber-50"), "py-16")}>
      <div className={cn(containerClass(), "text-center")}>
        {heading && <h2 className={cn(headingClass("3xl"), "mb-4")}>{heading}</h2>}
        {body && <p className="text-lg text-stone-600 mb-8">{body}</p>}
        <div className="flex flex-wrap justify-center gap-4">
          {platforms.map((p) => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants(), "no-underline button-themed")}>
              {p.label || p.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function CmsHours({ data }: { data: Record<string, unknown> }) {
  const schedule = (data.schedule as Array<{ day: string; open: string; close: string }>) || []
  return (
    <section className={sectionClass("bg-stone-50")}>
      <div className={containerClass()}>
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-6 w-6 text-amber-700" />
          <h2 className={headingClass("2xl")}>Hours</h2>
        </div>
        <dl className="space-y-3 max-w-xl">
          {schedule.map((row) => (
            <div key={row.day} className="flex justify-between">
              <dt className="text-sm font-medium text-stone-700">{row.day}</dt>
              <dd className="text-sm text-stone-500">
                {(row.open === "Closed" || row.close === "Closed") ? "Closed" : `${row.open} – ${row.close}`}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function CmsGallery({ data }: { data: Record<string, unknown> }) {
  const images = (data.images as string[]) || []
  const caption = data.caption as string | undefined
  if (images.length === 0) return null
  return (
    <section className={sectionClass("bg-white")}>
      <div className={containerClass()}>
        {caption && <h2 className={cn(headingClass("3xl"), "mb-8 text-center")}>{caption}</h2>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: "var(--grid-gap)" }}>
          {images.map((src, i) => (
            <div key={i} className={cn("aspect-square overflow-hidden bg-stone-100 image-themed")}>
              <img src={src} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CmsCta({ data }: { data: Record<string, unknown> }) {
  const heading = String(data.heading || "")
  const subtext = String(data.subtext || "")
  const buttonLabel = String(data.buttonLabel || "")
  const buttonLink = String(data.buttonLink || "/menu")
  return (
    <section className={cn(sectionClass("bg-amber-700"), "py-16")}>
      <div className={cn(containerClass(), "text-center")}>
        <h2 className={cn("text-3xl font-bold text-white mb-4", headingClass("3xl"))}>{heading}</h2>
        {subtext && <p className="text-lg text-amber-100 mb-8">{subtext}</p>}
        {buttonLabel && (
          <Link href={buttonLink} className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "no-underline button-themed")}>
            {buttonLabel}
          </Link>
        )}
      </div>
    </section>
  )
}

function CmsServices({ data }: { data: Record<string, unknown> }) {
  const title = String(data.title || "")
  const items = (data.items as Array<{ name: string; description: string; priceHint?: number; duration?: string }>) || []
  return (
    <section className={sectionClass("bg-white")}>
      <div className={containerClass()}>
        <h2 className={cn(headingClass("3xl"), "mb-8 text-center")}>{title}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "var(--grid-gap)" }}>
          {items.map((item) => (
            <div key={item.name} className={cardClass()}>
              <h3 className="font-semibold text-stone-900">{item.name}</h3>
              <p className="mt-2 text-sm text-stone-500">{item.description}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                {item.priceHint !== undefined && <span className="font-bold text-amber-700">${item.priceHint.toFixed(2)}</span>}
                {item.duration && <span className="text-stone-400">{item.duration}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CmsForm({ data }: { data: Record<string, unknown> }) {
  const title = String(data.title || "")
  const fields = (data.fields as Array<{ name: string; type: string; label: string; required: boolean }>) || []
  return (
    <section className={sectionClass("bg-stone-50")}>
      <div className={cn(containerClass(), "max-w-xl")}>
        <h2 className={cn(headingClass("3xl"), "mb-8 text-center")}>{title}</h2>
        <form className="space-y-6">
          {fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="block text-sm font-medium text-stone-700 mb-2">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea id={field.name} name={field.name} required={field.required} rows={4} className="w-full rounded-lg border border-stone-300 p-3" style={{ borderRadius: "var(--theme-border-radius)" }} />
              ) : (
                <input id={field.name} name={field.name} type={field.type} required={field.required} className="w-full rounded-lg border border-stone-300 p-3" style={{ borderRadius: "var(--theme-border-radius)" }} />
              )}
            </div>
          ))}
          <button type="submit" className={cn(buttonVariants(), "w-full button-themed")}>
            Submit
          </button>
        </form>
      </div>
    </section>
  )
}

function CmsFaq({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as Array<{ question: string; answer: string }>) || []
  return (
    <section className={sectionClass("bg-white")}>
      <div className={cn(containerClass(), "max-w-3xl")}>
        <h2 className={cn(headingClass("3xl"), "mb-8 text-center")}>Frequently Asked Questions</h2>
        <div className="space-y-6">
          {items.map((item, i) => (
            <div key={i} className={cardClass()}>
              <h3 className="font-semibold text-stone-900 mb-2">{item.question}</h3>
              <p className="text-sm text-stone-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CmsPromo({ data }: { data: Record<string, unknown> }) {
  const heading = String(data.heading || "")
  const body = String(data.body || "")
  const ctaLabel = String(data.ctaLabel || "")
  const ctaLink = String(data.ctaLink || "/menu")
  const image = data.image as string | undefined
  const hasImage = image && !image.includes("placeholder")
  return (
    <section className={cn(sectionClass("relative overflow-hidden bg-stone-900"), "py-20")}>
      {hasImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url('${image}')` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/80 to-stone-900" />
      )}
      <div className={cn(containerClass(), "relative text-center")}>
        <h2 className={cn(headingClass("3xl"), "mb-4 text-white")}>{heading}</h2>
        <p className="text-lg text-stone-300 mb-8">{body}</p>
        {ctaLabel && (
          <Link href={ctaLink} className={cn(buttonVariants({ size: "lg" }), "no-underline button-themed")}>
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  )
}

function CmsSlideshow({ data }: { data: Record<string, unknown> }) {
  const images = (data.images as string[]) || []
  const caption = data.caption as string | undefined
  if (images.length === 0) return null
  return (
    <section className={sectionClass("bg-white")}>
      <div className={containerClass()}>
        {caption && <h2 className={cn(headingClass("3xl"), "mb-8 text-center")}>{caption}</h2>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "var(--grid-gap)" }}>
          {images.map((src, i) => (
            <div key={i} className={cn("aspect-video overflow-hidden bg-stone-100 image-themed")}>
              <img src={src} alt={`Slide ${i + 1}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CmsSocialIcons({ data }: { data: Record<string, unknown> }) {
  const platforms = (data.platforms as Array<{ name: string; url: string; icon?: string }>) || []
  if (platforms.length === 0) return null
  return (
    <section className={sectionClass("bg-stone-50")}>
      <div className={cn(containerClass(), "text-center")}>
        <div className="flex flex-wrap justify-center gap-6">
          {platforms.map((p) => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "outline" }), "no-underline button-themed")}>
              {p.icon || p.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function CmsCallout({ data }: { data: Record<string, unknown> }) {
  const quote = String(data.quote || "")
  const author = data.author as string | undefined
  const role = data.role as string | undefined
  return (
    <section className={sectionClass("bg-amber-50")}>
      <div className={cn(containerClass(), "max-w-3xl text-center")}>
        <blockquote className="text-2xl font-medium text-stone-900 italic">&ldquo;{quote}&rdquo;</blockquote>
        {(author || role) && (
          <div className="mt-4 text-sm text-stone-500">
            {author && <span className="font-medium text-stone-700">{author}</span>}
            {author && role && <span> — </span>}
            {role && <span>{role}</span>}
          </div>
        )}
      </div>
    </section>
  )
}

function CmsHR({ data }: { data: Record<string, unknown> }) {
  const style = (data.style as string) || "solid"
  const color = (data.color as string) || "var(--color-stone-200, #e5e7eb)"
  const borderClass = style === "dashed" ? "border-dashed" : style === "dotted" ? "border-dotted" : "border-solid"
  return <hr className={`border-t ${borderClass}`} style={{ borderColor: color }} />
}

function CmsImageText({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as Array<{ image?: string; heading: string; body: string; align?: "left" | "right" }>) || []
  return (
    <section className={sectionClass("bg-white")}>
      <div className={containerClass()}>
        <div className="space-y-12">
          {items.map((item, i) => {
            const isReversed = item.align === "right"
            return (
              <div key={i} className={cn("grid items-center gap-8 md:grid-cols-2", isReversed && "md:direction-rtl")}>
                <div className={cn("overflow-hidden rounded-xl bg-stone-100 image-themed", isReversed && "md:order-2")}>
                  {item.image ? (
                    <img src={item.image} alt={item.heading} className="h-full w-full object-cover" />
                  ) : (
                    <div className="aspect-video w-full bg-stone-200" />
                  )}
                </div>
                <div className={cn(isReversed && "md:order-1")}>
                  <h3 className={headingClass("2xl")}>{item.heading}</h3>
                  <p className="mt-4 text-lg text-stone-600 whitespace-pre-line">{item.body}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function CmsComparison({ data }: { data: Record<string, unknown> }) {
  const title = data.title as string | undefined
  const columns = (data.columns as Array<{ header: string; features: Array<{ name: string; included: boolean }> }>) || []
  const ctaLabel = data.ctaLabel as string | undefined
  const ctaLink = data.ctaLink as string | undefined

  if (columns.length === 0) return null
  return (
    <section className={sectionClass("bg-stone-50")}>
      <div className={containerClass()}>
        {title && <h2 className={cn(headingClass("3xl"), "mb-8 text-center")}>{title}</h2>}
        <div className="overflow-x-auto">
          <table className="mx-auto min-w-full max-w-3xl border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left text-sm font-medium text-stone-500">Feature</th>
                {columns.map((col) => (
                  <th key={col.header} className="p-4 text-center text-sm font-semibold text-stone-900">{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {columns[0]?.features.map((feature, i) => (
                <tr key={feature.name}>
                  <td className="p-4 text-sm text-stone-700">{feature.name}</td>
                  {columns.map((col) => (
                    <td key={col.header} className="p-4 text-center">
                      {col.features[i]?.included ? (
                        <span className="text-amber-700">✓</span>
                      ) : (
                        <span className="text-stone-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {ctaLabel && ctaLink && (
          <div className="mt-8 text-center">
            <Link href={ctaLink} className={cn(buttonVariants({ size: "lg" }), "no-underline button-themed")}>
              {ctaLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}