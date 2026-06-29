import { z } from "zod"

// ── Block Data Schemas ────────────────────────────────────────────────────────

export const HeroBlockDataSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  ctaLabel: z.string(),
  ctaLink: z.string(),
  image: z.string().optional(),
})

export const TextBlockDataSchema = z.object({
  heading: z.string(),
  body: z.string(),
})

export const GalleryBlockDataSchema = z.object({
  images: z.array(z.string()),
  caption: z.string().optional(),
})

export const ProductsBlockDataSchema = z.object({
  title: z.string(),
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
  title: z.string(),
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
      text: z.string(),
      source: z.string().optional(),
    })
  ),
})

export const CtaBlockDataSchema = z.object({
  heading: z.string(),
  subtext: z.string(),
  buttonLabel: z.string(),
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
  title: z.string(),
  fields: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["text", "email", "tel", "textarea"]),
      label: z.string(),
      required: z.boolean(),
    })
  ),
})

export const PromoBlockDataSchema = z.object({
  heading: z.string(),
  body: z.string(),
  ctaLabel: z.string(),
  ctaLink: z.string(),
  image: z.string().optional(),
})

export const DeliveryBlockDataSchema = z.object({
  heading: z.string(),
  body: z.string(),
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
  caption: z.string().optional(),
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
  quote: z.string(),
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
      heading: z.string(),
      body: z.string(),
      align: z.enum(["left", "right"]).optional(),
    })
  ),
})

export const ComparisonBlockDataSchema = z.object({
  title: z.string().optional(),
  columns: z.array(
    z.object({
      header: z.string(),
      features: z.array(
        z.object({
          name: z.string(),
          included: z.boolean(),
        })
      ),
    })
  ),
  ctaLabel: z.string().optional(),
  ctaLink: z.string().optional(),
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
])

// ── Layer 1: Layout Output ────────────────────────────────────────────────────

export const LayoutOutputSchema = z.object({
  selected: z.record(z.string()),
  reasoning: z.string().optional(),
})

export type LayoutOutput = z.infer<typeof LayoutOutputSchema>

// ── Layer 2: Copy Output ─────────────────────────────────────────────────────

export const CopyBlockSchema = z.object({
  symbol: z.string(),
  data: BlockDataSchema,
})

export const CopyOutputSchema = z.object({
  blocks: z.array(CopyBlockSchema),
})

export type CopyOutput = z.infer<typeof CopyOutputSchema>

// ── Layer 3 / Final: Page Bundle ─────────────────────────────────────────────

export const CmsBlockSchema = z.object({
  type: z.string(),
  data: z.record(z.string(), z.unknown()),
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

export const PageBundleSchema = z.object({
  pages: z.array(CmsPageSchema),
})

export type PageBundle = z.infer<typeof PageBundleSchema>

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
