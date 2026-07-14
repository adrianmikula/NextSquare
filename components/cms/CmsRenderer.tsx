import Link from "next/link"
import { Star, Clock, MapPin, Coffee, Sandwich, GlassWater } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CmsBlock, BlockLayout } from "@/lib/cms"
import type { ComponentOverrides } from "@/lib/component-registry"
import { resolveComponentName } from "@/lib/component-registry"
import { CmsCarouselTestimonials } from "@/components/cms/CmsCarouselTestimonials"

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

const COMPONENT_MAP: Record<string, (props: { data: Record<string, unknown> }) => React.JSX.Element | null> = {
  hero: CmsHero,
  "overlay-hero": CmsHero,
  "split-hero": CmsSplitHero,
  text: CmsText,
  products: CmsProducts,
  testimonials: CmsTestimonials,
  "compact-testimonials": CmsCompactTestimonials,
  "carousel-testimonials": CmsCarouselTestimonials,
  delivery: CmsDelivery,
  hours: CmsHours,
  gallery: CmsGallery,
  cta: CmsCta,
  services: CmsServices,
  form: CmsForm,
  faq: CmsFaq,
  promo: CmsPromo,
  slideshow: CmsSlideshow,
  "social-icons": CmsSocialIcons,
  callout: CmsCallout,
  hr: CmsHR,
  "image-text": CmsImageText,
  comparison: CmsComparison,
  logo: CmsLogo,
  "business-name": CmsBusinessName,
  slogan: CmsSlogan,
  nav: CmsNav,
  sitemap: CmsSitemap,
  announcement: CmsAnnouncement,
  copyright: CmsCopyright,
  phone: CmsPhone,
  "page-layout": () => null,
}

const LAYOUT_CLASSES: Record<BlockLayout, string> = {
  "full-width": "block-layout-full-width",
  "half-width": "block-layout-half-width",
  "two-thirds": "block-layout-two-thirds",
  "sidebar-content": "block-layout-sidebar-content",
  "card-grid": "block-layout-card-grid",
  "full-bleed": "block-layout-full-bleed",
}

export function CmsBlockRenderer({ block, componentOverrides }: { block: CmsBlock; componentOverrides?: ComponentOverrides }) {
  const { type, data } = block
  const layout = block.layout as BlockLayout | undefined

  const componentName = resolveComponentName(type, componentOverrides)
  const Component = COMPONENT_MAP[componentName] ?? COMPONENT_MAP[type]
  if (!Component) return null

  const rendered = <Component data={data} />

  if (layout && layout !== "full-width") {
    const layoutClass = LAYOUT_CLASSES[layout]
    return <div className={layoutClass}>{rendered}</div>
  }

  return rendered
}

function sectionClass(semanticBg?: string) {
  return `${semanticBg || "bg-section"} section-py section-px`
}

function containerClass() {
  return "mx-auto container-max px-4 sm:px-6"
}

function cardClass(extra = "") {
  return cn(
    "card bg-base-100 rounded-xl border border-card p-6",
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
  return cn("text-heading", sizes[size] || sizes["3xl"])
}

function CmsHero({ data }: { data: Record<string, unknown> }) {
  const headline = String(data.headline || "")
  const subheadline = String(data.subheadline || "")
  const ctaLabel = String(data.ctaLebel || data.ctaLabel || "")
  const ctaLink = String(data.ctaLink || "/menu")
  const image = data.image as string | undefined
  const hasImage = image && !image.includes("placeholder")
  const variant = (data.variant as Record<string, unknown> | undefined)
  const overlayOpacity = typeof variant?.overlayOpacity === "number" ? variant.overlayOpacity : 0.4
  const textAlign = (variant?.textAlign as "left" | "center" | "right") || "center"
  const headingSize = (variant?.headingSize as string) || "4xl"
  const backgroundStyle = (variant?.backgroundStyle as string) || "gradient"
  const paddingY = (variant?.paddingY as string) || "py-24 sm:py-32"

  const alignClass = textAlign === "left" ? "text-left" : textAlign === "right" ? "text-right" : "text-center"
  const mxClass = textAlign === "center" ? "mx-auto" : textAlign === "right" ? "ml-auto" : "mr-auto"
  const sizeClass = headingClass(headingSize)

  return (
    <section className={cn("hero-section", sectionClass("bg-section-inverse"), paddingY)}>
      {backgroundStyle === "image" && hasImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${image}')`, opacity: overlayOpacity }}
        />
      ) : backgroundStyle === "gradient" ? (
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, color-mix(in srgb, var(--color-hero-bg) 70%, transparent), var(--color-hero-bg))` }} />
      ) : (
        <div className="absolute inset-0 bg-section-inverse" />
      )}
      <div className="hero-overlay" />
      <div className={cn(containerClass(), "relative", alignClass)}>
        <h1 className={cn(sizeClass, "text-hero-text")}>
          {headline}
        </h1>
        {subheadline && (
          <p className={cn("mt-6 max-w-2xl text-lg text-hero-muted", mxClass)}>{subheadline}</p>
        )}
        {ctaLabel && (
          <div className={cn("mt-8 flex items-center gap-4", textAlign === "center" && "justify-center")}>
            <Link href={ctaLink} className={cn(buttonVariants({ size: "lg" }), "no-underline")}>
              {ctaLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

function CmsSplitHero({ data }: { data: Record<string, unknown> }) {
  const headline = String(data.headline || "")
  const subheadline = String(data.subheadline || "")
  const ctaLabel = String(data.ctaLebel || data.ctaLabel || "")
  const ctaLink = String(data.ctaLink || "/menu")
  const image = data.image as string | undefined
  const hasImage = image && !image.includes("placeholder")
  const headingSize = (data.variant as Record<string, unknown> | undefined)?.headingSize as string | undefined || "4xl"

  return (
    <section className={cn(sectionClass("bg-section"), "py-16")}>
      <div className={containerClass()}>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className={cn(headingClass(headingSize), "text-heading")}>{headline}</h1>
            {subheadline && <p className="mt-4 text-lg text-body">{subheadline}</p>}
            {ctaLabel && (
              <div className="mt-8">
                <Link href={ctaLink} className={cn(buttonVariants({ size: "lg" }), "no-underline")}>{ctaLabel}</Link>
              </div>
            )}
          </div>
          {hasImage && (
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function CmsText({ data }: { data: Record<string, unknown> }) {
  const heading = String(data.heading || "")
  const body = String(data.body || "")
  return (
    <section className={sectionClass()}>
      <div className={containerClass()}>
        {heading && <h2 className={cn(headingClass("3xl"), "mb-6")}>{heading}</h2>}
        <p className="text-lg text-body whitespace-pre-line">{body}</p>
      </div>
    </section>
  )
}

function CmsProducts({ data }: { data: Record<string, unknown> }) {
  const title = String(data.title || "")
  const items = (data.items as Array<{ name: string; description: string; price?: number }>) || []
  return (
    <section className={sectionClass()}>
      <div className={containerClass()}>
        <div className="text-center">
          <h2 className={headingClass("3xl")}>{title}</h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3" style={{ gap: "var(--grid-gap)" }}>
          {items.map((item) => (
            <div key={item.name} className={cardClass()}>
              <h3 className="font-semibold text-heading leading-none tracking-tight">{item.name}</h3>
              <p className="mt-2 text-sm text-muted">{item.description}</p>
              {item.price !== undefined && (
                <p className="mt-4 text-lg font-bold text-price">${item.price.toFixed(2)}</p>
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
    <section className={sectionClass()}>
      <div className={containerClass()}>
        <div className="text-center">
          <h2 className={headingClass("3xl")}>What Our Customers Say</h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3" style={{ gap: "var(--grid-gap)" }}>
          {items.map((item) => (
            <div key={item.author} className={cardClass()}>
              <div className="mb-3 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-star text-star" />
                ))}
              </div>
              <p className="text-sm text-body">&ldquo;{item.text}&rdquo;</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs font-medium text-muted">— {item.author}</p>
                {item.source && <span className="text-xs text-muted">{item.source}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CmsCompactTestimonials({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as Array<{ author: string; text: string; source?: string }>) || []
  return (
    <section className={cn(sectionClass("bg-section-alt"), "py-12")}>
      <div className={cn(containerClass(), "divide-y divide-border")}>
        {items.map((item) => (
          <div key={item.author} className="py-4">
            <p className="text-sm text-body leading-relaxed">&ldquo;{item.text}&rdquo;</p>
            <p className="mt-1 text-xs font-medium text-muted">— {item.author}{item.source ? `, ${item.source}` : ""}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function CmsDelivery({ data }: { data: Record<string, unknown> }) {
  const heading = String(data.heading || "")
  const body = String(data.body || "")
  const platforms = (data.platforms as Array<{ name: string; url: string; label: string }>) || []
  return (
    <section className={cn(sectionClass("bg-section-alt"), "py-16")}>
      <div className={cn(containerClass(), "text-center")}>
        {heading && <h2 className={cn(headingClass("3xl"), "mb-4")}>{heading}</h2>}
        {body && <p className="text-lg text-body mb-8">{body}</p>}
        <div className="flex flex-wrap justify-center gap-4">
          {platforms.map((p) => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants(), "no-underline")}>
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
    <section className={sectionClass()}>
      <div className={containerClass()}>
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-6 w-6 text-price" />
          <h2 className={headingClass("2xl")}>Hours</h2>
        </div>
        <dl className="space-y-3 max-w-xl">
          {schedule.map((row) => (
            <div key={row.day} className="flex justify-between">
              <dt className="text-sm font-medium text-label">{row.day}</dt>
              <dd className="text-sm text-muted">
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
    <section className={sectionClass()}>
      <div className={containerClass()}>
        {caption && <h2 className={cn(headingClass("3xl"), "mb-8 text-center")}>{caption}</h2>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: "var(--grid-gap)" }}>
          {images.map((src, i) => (
            <div key={i} className={cn("aspect-square overflow-hidden bg-placeholder rounded-box")}>
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
    <section className={cn(sectionClass("bg-section-cta"), "py-16")}>
      <div className={cn(containerClass(), "text-center")}>
        <h2 className={cn("text-3xl font-bold text-cta-text mb-4", headingClass("3xl"))}>{heading}</h2>
        {subtext && <p className="text-lg text-cta-muted mb-8">{subtext}</p>}
        {buttonLabel && (
          <Link href={buttonLink} className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "no-underline")}>
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
    <section className={sectionClass()}>
      <div className={containerClass()}>
        <h2 className={cn(headingClass("3xl"), "mb-8 text-center")}>{title}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "var(--grid-gap)" }}>
          {items.map((item) => (
            <div key={item.name} className={cardClass()}>
              <h3 className="font-semibold text-heading">{item.name}</h3>
              <p className="mt-2 text-sm text-muted">{item.description}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                {item.priceHint !== undefined && <span className="font-bold text-price">${item.priceHint.toFixed(2)}</span>}
                {item.duration && <span className="text-muted">{item.duration}</span>}
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
    <section className={sectionClass()}>
      <div className={cn(containerClass(), "max-w-xl")}>
        <h2 className={cn(headingClass("3xl"), "mb-8 text-center")}>{title}</h2>
        <form className="space-y-6">
          {fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="block text-sm font-medium text-label mb-2">
                {field.label} {field.required && <span className="text-error">*</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea id={field.name} name={field.name} required={field.required} rows={4} className="w-full rounded-lg border p-3" style={{ borderRadius: "var(--theme-border-radius)", borderColor: "var(--color-input-border)" }} />
              ) : (
                <input id={field.name} name={field.name} type={field.type} required={field.required} className="w-full rounded-lg border p-3" style={{ borderRadius: "var(--theme-border-radius)", borderColor: "var(--color-input-border)" }} />
              )}
            </div>
          ))}
          <button type="submit" className={cn(buttonVariants(), "w-full")}>
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
    <section className={sectionClass()}>
      <div className={cn(containerClass(), "max-w-3xl")}>
        <h2 className={cn(headingClass("3xl"), "mb-8 text-center")}>Frequently Asked Questions</h2>
        <div className="space-y-6">
          {items.map((item, i) => (
            <div key={i} className={cardClass()}>
              <h3 className="font-semibold text-heading mb-2">{item.question}</h3>
              <p className="text-sm text-body">{item.answer}</p>
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
    <section className={cn(sectionClass("bg-section-inverse"), "py-20")}>
      {hasImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url('${image}')` }}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(to right, color-mix(in srgb, var(--color-announcement-bg) 80%, transparent), var(--color-hero-bg))` }} />
      )}
      <div className={cn(containerClass(), "relative text-center")}>
        <h2 className={cn(headingClass("3xl"), "mb-4 text-hero-text")}>{heading}</h2>
        <p className="text-lg text-hero-muted mb-8">{body}</p>
        {ctaLabel && (
          <Link href={ctaLink} className={cn(buttonVariants({ size: "lg" }), "no-underline")}>
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
    <section className={sectionClass()}>
      <div className={containerClass()}>
        {caption && <h2 className={cn(headingClass("3xl"), "mb-8 text-center")}>{caption}</h2>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "var(--grid-gap)" }}>
          {images.map((src, i) => (
            <div key={i} className={cn("aspect-video overflow-hidden bg-placeholder rounded-box")}>
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
    <section className={sectionClass()}>
      <div className={cn(containerClass(), "text-center")}>
        <div className="flex flex-wrap justify-center gap-6">
          {platforms.map((p) => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "outline" }), "no-underline")}>
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
    <section className={sectionClass("bg-section-alt")}>
      <div className={cn(containerClass(), "max-w-3xl text-center")}>
        <blockquote className="text-2xl font-medium text-heading italic">&ldquo;{quote}&rdquo;</blockquote>
        {(author || role) && (
          <div className="mt-4 text-sm text-muted">
            {author && <span className="font-medium text-label">{author}</span>}
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
  const color = (data.color as string) || "var(--color-card-border, var(--color-stone-200))"
  const borderClass = style === "dashed" ? "border-dashed" : style === "dotted" ? "border-dotted" : "border-solid"
  return <hr className={`border-t ${borderClass}`} style={{ borderColor: color }} />
}

function CmsImageText({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as Array<{ image?: string; heading: string; body: string; align?: "left" | "right" }>) || []
  return (
    <section className={sectionClass()}>
      <div className={containerClass()}>
        <div className="space-y-12">
          {items.map((item, i) => {
            const isReversed = item.align === "right"
            return (
              <div key={i} className={cn("grid items-center gap-8 md:grid-cols-2", isReversed && "md:direction-rtl")}>
                <div className={cn("overflow-hidden rounded-xl bg-placeholder rounded-box", isReversed && "md:order-2")}>
                  {item.image ? (
                    <img src={item.image} alt={item.heading} className="h-full w-full object-cover" />
                  ) : (
                    <div className="aspect-video w-full bg-placeholder" />
                  )}
                </div>
                <div className={cn(isReversed && "md:order-1")}>
                  <h3 className={headingClass("2xl")}>{item.heading}</h3>
                  <p className="mt-4 text-lg text-body whitespace-pre-line">{item.body}</p>
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
    <section className={sectionClass()}>
      <div className={containerClass()}>
        {title && <h2 className={cn(headingClass("3xl"), "mb-8 text-center")}>{title}</h2>}
        <div className="overflow-x-auto">
          <table className="mx-auto min-w-full max-w-3xl border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left text-sm font-medium text-muted">Feature</th>
                {columns.map((col) => (
                  <th key={col.header} className="p-4 text-center text-sm font-semibold text-heading">{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--color-card-border)" }}>
              {columns[0]?.features.map((feature, i) => (
                <tr key={feature.name}>
                  <td className="p-4 text-sm text-label">{feature.name}</td>
                  {columns.map((col) => (
                    <td key={col.header} className="p-4 text-center">
                      {col.features[i]?.included ? (
                        <span className="text-check">✓</span>
                      ) : (
                        <span className="text-muted">—</span>
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
            <Link href={ctaLink} className={cn(buttonVariants({ size: "lg" }), "no-underline")}>
              {ctaLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

function CmsLogo({ data }: { data: Record<string, unknown> }) {
  const image = data.image as string | undefined
  const text = data.text as string | undefined
  const link = data.link as string | undefined
  const content = (
    <div className="flex items-center gap-2">
      {image && <img src={image} alt={text || "logo"} className="h-8 w-8 object-contain" />}
      {text && <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>{text}</span>}
    </div>
  )
  if (link) {
    return <Link href={link} className="no-underline text-heading">{content}</Link>
  }
  return content
}

function CmsBusinessName({ data }: { data: Record<string, unknown> }) {
  const text = String(data.text || "")
  const link = data.link as string | undefined
  if (link) {
    return <Link href={link} className="no-underline text-lg font-semibold text-heading">{text}</Link>
  }
  return <span className="text-lg font-semibold text-heading">{text}</span>
}

function CmsSlogan({ data }: { data: Record<string, unknown> }) {
  const text = String(data.text || "")
  if (!text) return null
  return <p className="text-sm text-muted italic">{text}</p>
}

function CmsNav({ data }: { data: Record<string, unknown> }) {
  const links = (data.links as Array<{ href: string; label: string }>) || []
  const sticky = data.sticky as boolean | undefined
  const variant = data.variant as string | undefined
  const isHomeNav = variant === "home"
  const filteredLinks = isHomeNav ? links.filter(l => l.href !== "/") : links
  const stickyClass = sticky ? "sticky top-0 z-50" : "relative"
  return (
    <nav className={cn("flex items-center gap-6", stickyClass)}>
      {filteredLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm font-medium text-link transition-colors hover-text-link-hover"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}

function CmsSitemap({ data }: { data: Record<string, unknown> }) {
  const columns = (data.columns as Array<{ title: string; links: Array<{ href: string; label: string }> }>) || []
  if (columns.length === 0) return null
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {columns.map((col, i) => (
        <div key={i}>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">{col.title}</h4>
          <ul className="space-y-2">
            {col.links.map((link, j) => (
              <li key={j}>
                <Link href={link.href} className="text-sm text-link hover-text-link-hover">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function CmsAnnouncement({ data }: { data: Record<string, unknown> }) {
  const text = String(data.text || "")
  const link = data.link as string | undefined
  const linkLabel = data.linkLabel as string | undefined
  if (!text) return null
  return (
    <div className="text-center py-2 px-4 text-sm" style={{ backgroundColor: "var(--color-announcement-bg)", color: "var(--color-announcement-text)" }}>
      {text}
      {link && linkLabel && (
        <Link href={link} className="ml-2 underline font-medium">{linkLabel}</Link>
      )}
    </div>
  )
}

function CmsCopyright({ data }: { data: Record<string, unknown> }) {
  const name = data.name as string | undefined
  const year = data.year as number | undefined
  const text = data.text as string | undefined
  const displayYear = year ?? new Date().getFullYear()
  const displayName = name || "Cafe Template"
  return (
    <p className="text-xs text-muted text-center">
      {text || `© ${displayYear} ${displayName}. Built with Next.js.`}
    </p>
  )
}

function CmsPhone({ data }: { data: Record<string, unknown> }) {
  const number = String(data.number || "")
  const display = (data.display as string | undefined) || number
  const label = data.label as string | undefined
  if (!number) return null
  return (
    <a href={`tel:${number}`} className="flex items-center gap-2 text-sm text-link hover-text-link-hover">
      {label && <span className="font-medium">{label}:</span>}
      <span>{display}</span>
    </a>
  )
}