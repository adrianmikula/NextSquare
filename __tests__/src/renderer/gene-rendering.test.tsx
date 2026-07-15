// @vitest-environment happy-dom
import { describe, expect, it, vi, beforeEach } from "vitest"
import { render } from "@testing-library/react"
import { SitePage } from "@/src/renderer/site-page"
import type { SiteConfig } from "@/src/schema/site-config"

vi.mock("@soltana-ui/react", () => ({
  SoltanaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSoltana: () => ({
    config: { relief: "flat" as const, finish: "matte" as const },
  }),
}))

vi.mock("taste-engine/react", () => {
  const setTuners = vi.fn()
  return {
    TasteProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useTuners: () => ({ tuners: {}, setTuners }),
    useTaste: () => ({}),
  }
})

vi.mock("soltana-ui/css", () => ({}))

const HERO_CONFIG: SiteConfig = {
  meta: { name: "Test Hero", industry: "test", tone: "test" },
  designLanguage: { relief: "flat", finish: "matte", shape: "squircle" },
  tuners: { warmth: 0.5, density: 0.5, motion: 0.5, contrast: 0.5, narrative: 0.5 },
  spec: {
    root: "page",
    elements: {
      page: { type: "Container", props: {}, children: ["hero-1"] },
      "hero-1": {
        type: "HeroCentered",
        props: {
          headline: "Test Headline Here",
          subheadline: "Test subheadline text",
          ctaLabel: "Click Me",
          ctaLink: "/test",
        },
        children: [],
      },
    },
  },
  content: {},
}

const FEATURES_CONFIG: SiteConfig = {
  meta: { name: "Test Features", industry: "test", tone: "test" },
  designLanguage: { relief: "flat", finish: "matte", shape: "squircle" },
  tuners: { warmth: 0.5, density: 0.5, motion: 0.5, contrast: 0.5, narrative: 0.5 },
  spec: {
    root: "page",
    elements: {
      page: { type: "Container", props: {}, children: ["features-1"] },
      "features-1": {
        type: "FeaturesGrid",
        props: {
          headline: "Our Features",
          items: [
            { title: "Feature A", description: "Description A", icon: "⭐" },
            { title: "Feature B", description: "Description B" },
          ],
        },
        children: [],
      },
    },
  },
  content: {},
}

const CTA_CONFIG: SiteConfig = {
  meta: { name: "Test CTA", industry: "test", tone: "test" },
  designLanguage: { relief: "flat", finish: "matte", shape: "squircle" },
  tuners: { warmth: 0.5, density: 0.5, motion: 0.5, contrast: 0.5, narrative: 0.5 },
  spec: {
    root: "page",
    elements: {
      page: { type: "Container", props: {}, children: ["cta-1"] },
      "cta-1": {
        type: "CtaSimple",
        props: {
          headline: "Call to Action",
          ctaLabel: "Get Started",
          ctaLink: "/signup",
        },
        children: [],
      },
    },
  },
  content: {},
}

describe("Gene rendering through json-render pipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders a HeroCentered gene with headline text inside [data-site-page]", () => {
    const { container } = render(<SitePage config={HERO_CONFIG} />)

    const wrapper = container.querySelector("[data-site-page]")
    expect(wrapper).not.toBeNull()

    expect(wrapper!.textContent).toContain("Test Headline Here")
    expect(wrapper!.textContent).toContain("Test subheadline text")
    expect(wrapper!.textContent).toContain("Click Me")
  })

  it("renders a FeaturesGrid gene with feature titles inside [data-site-page]", () => {
    const { container } = render(<SitePage config={FEATURES_CONFIG} />)

    const wrapper = container.querySelector("[data-site-page]")
    expect(wrapper).not.toBeNull()

    expect(wrapper!.textContent).toContain("Our Features")
    expect(wrapper!.textContent).toContain("Feature A")
    expect(wrapper!.textContent).toContain("Feature B")
    expect(wrapper!.textContent).toContain("Description A")
    expect(wrapper!.textContent).toContain("Description B")
  })

  it("renders a CtaSimple gene with CTA text inside [data-site-page]", () => {
    const { container } = render(<SitePage config={CTA_CONFIG} />)

    const wrapper = container.querySelector("[data-site-page]")
    expect(wrapper).not.toBeNull()

    expect(wrapper!.textContent).toContain("Call to Action")
    expect(wrapper!.textContent).toContain("Get Started")
  })

  it("renders multiple gene sections in sequence", () => {
    const multiConfig: SiteConfig = {
      meta: { name: "Multi", industry: "test", tone: "test" },
      designLanguage: { relief: "flat", finish: "matte", shape: "squircle" },
      tuners: { warmth: 0.5, density: 0.5, motion: 0.5, contrast: 0.5, narrative: 0.5 },
      spec: {
        root: "page",
        elements: {
          page: { type: "Container", props: {}, children: ["hero-1", "features-1", "cta-1"] },
          "hero-1": {
            type: "HeroCentered",
            props: { headline: "Hero Title", ctaLabel: "Hero CTA" },
            children: [],
          },
          "features-1": {
            type: "FeaturesGrid",
            props: {
              headline: "Features Title",
              items: [{ title: "F1", description: "D1" }],
            },
            children: [],
          },
          "cta-1": {
            type: "CtaSimple",
            props: { headline: "CTA Title", ctaLabel: "CTA Button" },
            children: [],
          },
        },
      },
      content: {},
    }

    const { container } = render(<SitePage config={multiConfig} />)

    const wrapper = container.querySelector("[data-site-page]")
    expect(wrapper).not.toBeNull()

    expect(wrapper!.textContent).toContain("Hero Title")
    expect(wrapper!.textContent).toContain("Features Title")
    expect(wrapper!.textContent).toContain("CTA Title")
    expect(wrapper!.textContent).toContain("Hero CTA")
    expect(wrapper!.textContent).toContain("CTA Button")
  })

  it("renders HeroSplit with split layout content", () => {
    const config: SiteConfig = {
      meta: { name: "Split", industry: "test", tone: "test" },
      designLanguage: { relief: "flat", finish: "matte", shape: "squircle" },
      tuners: { warmth: 0.5, density: 0.5, motion: 0.5, contrast: 0.5, narrative: 0.5 },
      spec: {
        root: "page",
        elements: {
          page: { type: "Container", props: {}, children: ["hero-1"] },
          "hero-1": {
            type: "HeroSplit",
            props: {
              headline: "Split Headline",
              subheadline: "Split subtext",
              ctaLabel: "Split CTA",
            },
            children: [],
          },
        },
      },
      content: {},
    }

    const { container } = render(<SitePage config={config} />)
    const wrapper = container.querySelector("[data-site-page]")
    expect(wrapper).not.toBeNull()
    expect(wrapper!.textContent).toContain("Split Headline")
    expect(wrapper!.textContent).toContain("Split subtext")
    expect(wrapper!.textContent).toContain("Split CTA")
  })

  it("renders HeroMinimal with minimal content (no CTA)", () => {
    const config: SiteConfig = {
      meta: { name: "Minimal", industry: "test", tone: "test" },
      designLanguage: { relief: "flat", finish: "matte", shape: "squircle" },
      tuners: { warmth: 0.5, density: 0.5, motion: 0.5, contrast: 0.5, narrative: 0.5 },
      spec: {
        root: "page",
        elements: {
          page: { type: "Container", props: {}, children: ["hero-1"] },
          "hero-1": {
            type: "HeroMinimal",
            props: { headline: "Minimal Headline", subheadline: "Minimal sub" },
            children: [],
          },
        },
      },
      content: {},
    }

    const { container } = render(<SitePage config={config} />)
    const wrapper = container.querySelector("[data-site-page]")
    expect(wrapper).not.toBeNull()
    expect(wrapper!.textContent).toContain("Minimal Headline")
    expect(wrapper!.textContent).toContain("Minimal sub")
  })

  it("renders CtaSplit with split CTA content", () => {
    const config: SiteConfig = {
      meta: { name: "CTASplit", industry: "test", tone: "test" },
      designLanguage: { relief: "flat", finish: "matte", shape: "squircle" },
      tuners: { warmth: 0.5, density: 0.5, motion: 0.5, contrast: 0.5, narrative: 0.5 },
      spec: {
        root: "page",
        elements: {
          page: { type: "Container", props: {}, children: ["cta-1"] },
          "cta-1": {
            type: "CtaSplit",
            props: {
              headline: "Split CTA Headline",
              subheadline: "Split CTA subtext",
              ctaLabel: "Split CTA Button",
            },
            children: [],
          },
        },
      },
      content: {},
    }

    const { container } = render(<SitePage config={config} />)
    const wrapper = container.querySelector("[data-site-page]")
    expect(wrapper).not.toBeNull()
    expect(wrapper!.textContent).toContain("Split CTA Headline")
    expect(wrapper!.textContent).toContain("Split CTA subtext")
    expect(wrapper!.textContent).toContain("Split CTA Button")
  })

  it("renders FeaturesAlternating with alternating feature items", () => {
    const config: SiteConfig = {
      meta: { name: "AltFeatures", industry: "test", tone: "test" },
      designLanguage: { relief: "flat", finish: "matte", shape: "squircle" },
      tuners: { warmth: 0.5, density: 0.5, motion: 0.5, contrast: 0.5, narrative: 0.5 },
      spec: {
        root: "page",
        elements: {
          page: { type: "Container", props: {}, children: ["features-1"] },
          "features-1": {
            type: "FeaturesAlternating",
            props: {
              headline: "Alternating Features",
              items: [
                { title: "Alt A", description: "Desc A" },
                { title: "Alt B", description: "Desc B" },
              ],
            },
            children: [],
          },
        },
      },
      content: {},
    }

    const { container } = render(<SitePage config={config} />)
    const wrapper = container.querySelector("[data-site-page]")
    expect(wrapper).not.toBeNull()
    expect(wrapper!.textContent).toContain("Alternating Features")
    expect(wrapper!.textContent).toContain("Alt A")
    expect(wrapper!.textContent).toContain("Alt B")
  })

  it("renders with glassmorphic relief without errors", () => {
    const config: SiteConfig = {
      meta: { name: "Glass", industry: "test", tone: "test" },
      designLanguage: { relief: "glassmorphic", finish: "frosted", shape: "superellipse" },
      tuners: { warmth: 0.9, density: 0.2, motion: 0.7, contrast: 0.8, narrative: 0.6 },
      spec: {
        root: "page",
        elements: {
          page: { type: "Container", props: {}, children: ["hero-1"] },
          "hero-1": {
            type: "HeroCentered",
            props: { headline: "Glass Hero" },
            children: [],
          },
        },
      },
      content: {},
    }

    const { container } = render(<SitePage config={config} />)
    const wrapper = container.querySelector("[data-site-page]")
    expect(wrapper).not.toBeNull()
    expect(wrapper!.textContent).toContain("Glass Hero")
  })

  it("renders with neumorphic relief without errors", () => {
    const config: SiteConfig = {
      meta: { name: "Neumo", industry: "test", tone: "test" },
      designLanguage: { relief: "neumorphic", finish: "matte", shape: "clothoid" },
      tuners: { warmth: 0.3, density: 0.15, motion: 0.2, contrast: 0.3, narrative: 0.5 },
      spec: {
        root: "page",
        elements: {
          page: { type: "Container", props: {}, children: ["hero-1"] },
          "hero-1": {
            type: "HeroCentered",
            props: { headline: "Neumo Hero" },
            children: [],
          },
        },
      },
      content: {},
    }

    const { container } = render(<SitePage config={config} />)
    const wrapper = container.querySelector("[data-site-page]")
    expect(wrapper).not.toBeNull()
    expect(wrapper!.textContent).toContain("Neumo Hero")
  })

  it("renders content merged from config.content into spec props", () => {
    const config: SiteConfig = {
      meta: { name: "ContentTest", industry: "test", tone: "test" },
      designLanguage: { relief: "flat", finish: "matte", shape: "squircle" },
      tuners: { warmth: 0.5, density: 0.5, motion: 0.5, contrast: 0.5, narrative: 0.5 },
      spec: {
        root: "page",
        elements: {
          page: { type: "Container", props: {}, children: ["hero-1"] },
          "hero-1": {
            type: "HeroCentered",
            props: { headline: "Old Headline", subheadline: "Old Sub", ctaLabel: "CTA" },
            children: [],
          },
        },
      },
      content: {
        "hero-headline": "Content-Driven Headline",
        "hero-subheadline": "Content Sub",
      },
    }

    const { container } = render(<SitePage config={config} />)
    const wrapper = container.querySelector("[data-site-page]")
    expect(wrapper).not.toBeNull()
    expect(wrapper!.textContent).toContain("Content-Driven Headline")
    expect(wrapper!.textContent).toContain("Content Sub")
    expect(wrapper!.textContent).not.toContain("Old Headline")
    expect(wrapper!.textContent).not.toContain("Old Sub")
  })
})
