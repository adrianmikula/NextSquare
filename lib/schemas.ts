import { z } from "zod"

export const VariantString = z.union([z.string(), z.object({ a: z.string(), b: z.string() })])

// ── Block Data Schemas ────────────────────────────────────────────────────────

export const HeroBlockDataSchema = z.object({
  headline: VariantString,
  subheadline: VariantString,
  ctaLabel: VariantString,
  ctaLink: z.string(),
  image: z.string().optional(),
  variant: z.object({
    height: z.string().optional(),
    overlayOpacity: z.number().optional(),
    textAlign: z.enum(["left", "center", "right"]).optional(),
    headingSize: z.enum(["2xl", "3xl", "4xl", "5xl", "6xl"]).optional(),
    backgroundStyle: z.enum(["gradient", "image", "solid"]).optional(),
  }).optional(),
})

export const TextBlockDataSchema = z.object({
  heading: VariantString,
  body: VariantString,
})

export const GalleryBlockDataSchema = z.object({
  images: z.array(z.string()),
  caption: VariantString.optional(),
})

export const ProductsBlockDataSchema = z.object({
  title: VariantString,
  items: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      price: z.number().optional(),
      image: z.string().optional(),
    })
  ),
})

export const ServicesBlockDataSchema = z.object({
  title: VariantString,
  items: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      priceHint: z.number().optional(),
      duration: z.string().optional(),
    })
  ),
})

export const TestimonialsBlockDataSchema = z.object({
  items: z.array(
    z.object({
      author: z.string(),
      text: VariantString,
      source: z.string().optional(),
    })
  ),
})

export const CtaBlockDataSchema = z.object({
  heading: VariantString,
  subtext: VariantString,
  buttonLabel: VariantString,
  buttonLink: z.string(),
})

export const HoursBlockDataSchema = z.object({
  schedule: z.array(
    z.object({
      day: z.string(),
      open: z.string(),
      close: z.string(),
    })
  ),
})

export const FaqBlockDataSchema = z.object({
  items: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ),
})

export const FormBlockDataSchema = z.object({
  title: VariantString,
  fields: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["text", "email", "tel", "textarea"]),
      label: VariantString,
      required: z.boolean(),
    })
  ),
})

export const PromoBlockDataSchema = z.object({
  heading: VariantString,
  body: VariantString,
  ctaLabel: VariantString,
  ctaLink: z.string(),
  image: z.string().optional(),
})

export const DeliveryBlockDataSchema = z.object({
  heading: VariantString,
  body: VariantString,
  platforms: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      label: z.string(),
    })
  ),
})

export const SlideshowBlockDataSchema = z.object({
  images: z.array(z.string()),
  caption: VariantString.optional(),
  interval: z.number().optional(),
})

export const SocialIconsBlockDataSchema = z.object({
  platforms: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      icon: z.string().optional(),
    })
  ),
})

export const CalloutBlockDataSchema = z.object({
  quote: VariantString,
  author: z.string().optional(),
  role: z.string().optional(),
})

export const HrBlockDataSchema = z.object({
  style: z.enum(["solid", "dashed", "dotted"]).optional(),
  color: z.string().optional(),
})

export const ImageTextBlockDataSchema = z.object({
  items: z.array(
    z.object({
      image: z.string().optional(),
      heading: VariantString,
      body: VariantString,
      align: z.enum(["left", "right"]).optional(),
    })
  ),
})

export const ComparisonBlockDataSchema = z.object({
  title: VariantString.optional(),
  columns: z.array(
    z.object({
      header: VariantString,
      features: z.array(
        z.object({
          name: z.string(),
          included: z.boolean(),
        })
      ),
    })
  ),
  ctaLabel: VariantString.optional(),
  ctaLink: z.string().optional(),
})

export const MapBlockDataSchema = z.object({
  address: z.string(),
  suburb: z.string(),
  city: z.string(),
  embedUrl: z.string().optional(),
  directionsUrl: z.string().optional(),
})

export const TeamBlockDataSchema = z.object({
  title: z.string().optional(),
  items: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      bio: z.string().optional(),
      photo: z.string().optional(),
    })
  ),
})

export const ReservationBlockDataSchema = z.object({
  title: z.string().optional(),
  fields: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      label: z.string(),
      required: z.boolean(),
    })
  ),
  prefillName: z.string().optional(),
  prefillPhone: z.string().optional(),
})

export const LogoBlockDataSchema = z.object({
  image: z.string().optional(),
  text: z.string().optional(),
  link: z.string().optional(),
})

export const BusinessNameBlockDataSchema = z.object({
  text: z.string(),
  link: z.string().optional(),
})

export const SloganBlockDataSchema = z.object({
  text: z.string(),
})

export const NavBlockDataSchema = z.object({
  links: z.array(
    z.object({
      href: z.string(),
      label: z.string(),
    })
  ),
  sticky: z.boolean().optional(),
  variant: z.enum(["home", "page"]).optional(),
})

export const SitemapBlockDataSchema = z.object({
  columns: z.array(
    z.object({
      title: z.string(),
      links: z.array(
        z.object({
          href: z.string(),
          label: z.string(),
        })
      ),
    })
  ),
})

export const AnnouncementBlockDataSchema = z.object({
  text: z.string(),
  link: z.string().optional(),
  linkLabel: z.string().optional(),
})

export const CopyrightBlockDataSchema = z.object({
  text: z.string().optional(),
  name: z.string().optional(),
  year: z.number().optional(),
})

export const PhoneBlockDataSchema = z.object({
  number: z.string(),
  display: z.string().optional(),
  label: z.string().optional(),
})

export const PageLayoutBlockDataSchema = z.object({
  maxWidth: z.enum(["narrow", "standard", "wide", "full"]).optional(),
  contentAlign: z.enum(["left", "center"]).optional(),
  sectionSpacing: z.enum(["compact", "standard", "spacious"]).optional(),
  sidebarPosition: z.enum(["left", "right", "none"]).optional(),
})

export const BlockDataSchema = z.union([
  HeroBlockDataSchema,
  TextBlockDataSchema,
  GalleryBlockDataSchema,
  ProductsBlockDataSchema,
  ServicesBlockDataSchema,
  TestimonialsBlockDataSchema,
  CtaBlockDataSchema,
  HoursBlockDataSchema,
  FaqBlockDataSchema,
  FormBlockDataSchema,
  PromoBlockDataSchema,
  DeliveryBlockDataSchema,
  SlideshowBlockDataSchema,
  SocialIconsBlockDataSchema,
  CalloutBlockDataSchema,
  HrBlockDataSchema,
  ImageTextBlockDataSchema,
  ComparisonBlockDataSchema,
  MapBlockDataSchema,
  TeamBlockDataSchema,
  ReservationBlockDataSchema,
  LogoBlockDataSchema,
  BusinessNameBlockDataSchema,
  SloganBlockDataSchema,
  NavBlockDataSchema,
  SitemapBlockDataSchema,
  AnnouncementBlockDataSchema,
  CopyrightBlockDataSchema,
  PhoneBlockDataSchema,
])

// ── Layer 1: Layout Output ────────────────────────────────────────────────────

export const LayoutVariantSchema = z.object({
  id: z.string().default("A"),
  archetype: z.string(),
  order: z.array(z.string()),
  reasoning: z.string().optional(),
})

export const LayoutOutputSchema = z.object({
  selected: z.record(
    z.object({
      archetype: z.string(),
      variants: z.array(LayoutVariantSchema),
    })
  ),
  reasoning: z.string().optional(),
})

export type LayoutOutput = z.infer<typeof LayoutOutputSchema>

// ── Layer 2: Copy Output ─────────────────────────────────────────────────────

export const TextVariantSchema = z.object({
  symbol: z.string(),
  a: z.record(z.any()),
  b: z.record(z.any()),
})

export const CopyBlockSchema = z.object({
  symbol: z.string(),
  wordingVariants: z.object({
    a: z.record(z.any()),
    b: z.record(z.any()),
  }),
})

export const CopyOutputSchema = z.object({
  blocks: z.array(CopyBlockSchema),
})

export type CopyOutput = z.infer<typeof CopyOutputSchema>

export type LayoutVariant = z.infer<typeof LayoutVariantSchema>
export type TextVariant = z.infer<typeof TextVariantSchema>

// ── Layer 3 / Final: Page Bundle ─────────────────────────────────────────────

export const BlockLayoutSchema = z.enum([
  "full-width", "half-width", "two-thirds", "sidebar-content", "card-grid", "full-bleed",
])

export const CmsBlockSchema = z.object({
  type: z.string(),
  data: z.record(z.string(), z.unknown()),
  layout: BlockLayoutSchema.optional(),
})

export const CmsPageSchema = z.object({
  slug: z.string(),
  label: z.string(),
  blocks: z.array(CmsBlockSchema),
  seo: z
    .object({
      title: z.string(),
      description: z.string(),
    })
    .optional(),
})

export const PageVariantSchema = z.object({
  id: z.string(),
  reasoning: z.string().optional(),
  order: z.array(z.string()),
  blocks: z.array(CmsBlockSchema),
})

export const PageBundleSchema = z.object({
  pages: z.array(
    z.object({
      slug: z.string(),
      label: z.string(),
      archetype: z.string(),
      variants: z.array(PageVariantSchema),
      seo: z
        .object({
          title: z.string(),
          description: z.string(),
        })
        .optional(),
    })
  ),
})

export type PageBundle = z.infer<typeof PageBundleSchema>
export type PageVariant = z.infer<typeof PageVariantSchema>

// ── Archetype Catalog ─────────────────────────────────────────────────────────

export const ArchetypeMetadataSchema = z.object({
  blocks: z.array(z.string()),
  minData: z.record(z.string()).optional(),
  excludes: z.array(z.string()).optional(),
  bestFor: z.array(z.string()).optional(),
  typicalOrder: z.number().optional(),
})

export const BlockVocabularySchema = z.record(
  z.object({
    description: z.string(),
    fields: z.array(z.string()),
  })
)

export const ArchetypeCatalogSchema = z.object({
  version: z.string(),
  tenant: z.string().optional(),
  blockVocabulary: BlockVocabularySchema,
  archetypes: z.record(ArchetypeMetadataSchema),
  selectionRules: z.array(z.any()).optional(),
  generatedAt: z.string().optional(),
})

export type ArchetypeCatalog = z.infer<typeof ArchetypeCatalogSchema>
export type ArchetypeMetadata = z.infer<typeof ArchetypeMetadataSchema>
