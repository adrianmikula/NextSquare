import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { SitePage } from "@/src/renderer/site-page"
import type { SiteConfig } from "@/src/schema/site-config"

let capturedRendererProps: Record<string, unknown> = {}

vi.mock("@json-render/react", () => ({
  Renderer: ({ "data-testid": _dt, ...props }: Record<string, unknown>) => {
    capturedRendererProps = props
    return <div data-testid="json-renderer" data-spec-root={(props.spec as any)?.root ?? ""} />
  },
  StateProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ActionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  VisibilityProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock("@soltana-ui/react", () => ({
  SoltanaProvider: ({ children, config }: { children: React.ReactNode; config: any }) => (
    <div data-testid="soltana-provider" data-relief={config?.relief} data-finish={config?.finish}>
      {children}
    </div>
  ),
  useSoltana: () => ({
    config: { relief: "flat", finish: "matte" },
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

const MINIMAL_CONFIG: SiteConfig = {
  meta: { name: "Test Site", industry: "test", tone: "neutral" },
  designLanguage: { relief: "flat", finish: "matte", shape: "squircle" },
  tuners: { warmth: 0.5, density: 0.5, motion: 0.5, contrast: 0.5, narrative: 0.5 },
  spec: {
    root: "page",
    elements: {
      page: { type: "Container", props: {}, children: [] },
    },
  },
  content: {},
}

const ALL_TUNER_CONFIG: SiteConfig = {
  meta: { name: "All Tuners", industry: "test", tone: "vibrant" },
  designLanguage: { relief: "glassmorphic", finish: "frosted", shape: "superellipse" },
  tuners: { warmth: 0.9, density: 0.2, motion: 0.7, contrast: 0.8, narrative: 0.6 },
  spec: {
    root: "page",
    elements: {
      page: { type: "Container", props: {}, children: [] },
    },
  },
  content: {},
}

const NEUMORPHIC_CONFIG: SiteConfig = {
  meta: { name: "Neumo", industry: "test", tone: "soft" },
  designLanguage: { relief: "neumorphic", finish: "matte", shape: "clothoid" },
  tuners: { warmth: 0.3, density: 0.15, motion: 0.2, contrast: 0.3, narrative: 0.5 },
  spec: {
    root: "page",
    elements: {
      page: { type: "Container", props: {}, children: [] },
    },
  },
  content: {},
}

function getStyleText(container: HTMLElement): string {
  const style = container.querySelector("style")
  return style?.textContent ?? ""
}

describe("SitePage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedRendererProps = {}
  })

  it("renders without error with minimal config", () => {
    const { container } = render(<SitePage config={MINIMAL_CONFIG} />)
    expect(container.querySelector("style")).toBeTruthy()
    expect(screen.getByTestId("json-renderer")).toBeTruthy()
  })

  it("injects tuner CSS vars", () => {
    const { container } = render(<SitePage config={MINIMAL_CONFIG} />)
    const styleText = getStyleText(container)
    expect(styleText).toContain("--tuner-warmth")
    expect(styleText).toContain("--tuner-density")
    expect(styleText).toContain("--tuner-motion")
    expect(styleText).toContain("--tuner-contrast")
    expect(styleText).toContain("--tuner-narrative")
  })

  it("injects shape CSS vars", () => {
    const { container } = render(<SitePage config={MINIMAL_CONFIG} />)
    const styleText = getStyleText(container)
    expect(styleText).toContain("--shape-corner-radius")
    expect(styleText).toContain("--shape-button-radius")
    expect(styleText).toContain("--shape-card-radius")
    expect(styleText).toContain("--shape-image-radius")
  })

  it("injects color bridge CSS vars", () => {
    const { container } = render(<SitePage config={MINIMAL_CONFIG} />)
    const styleText = getStyleText(container)
    expect(styleText).toContain("--color-hero-bg")
    expect(styleText).toContain("--color-primary")
    expect(styleText).toContain("--color-heading")
    expect(styleText).toContain("--color-body")
    expect(styleText).toContain("--color-card-bg")
    expect(styleText).toContain("--color-section-bg")
    expect(styleText).toContain("--color-cta-text")
  })

  it("injects archetype CSS vars", () => {
    const { container } = render(<SitePage config={MINIMAL_CONFIG} />)
    const styleText = getStyleText(container)
    expect(styleText).toContain("--arch-surface-bg")
    expect(styleText).toContain("--arch-surface-shadow")
    expect(styleText).toContain("--arch-surface-border")
    expect(styleText).toContain("--arch-card-bg")
    expect(styleText).toContain("--arch-corner-radius")
  })

  it("passes design language to SoltanaProvider", () => {
    render(<SitePage config={MINIMAL_CONFIG} />)
    const provider = screen.getByTestId("soltana-provider")
    expect(provider).toHaveAttribute("data-relief", "flat")
    expect(provider).toHaveAttribute("data-finish", "matte")
  })

  it("renders with glassmorphic relief", () => {
    const { container } = render(<SitePage config={ALL_TUNER_CONFIG} />)
    const styleText = getStyleText(container)
    expect(styleText).toContain("--tuner-warmth:0.9")
    expect(styleText).toContain("--tuner-density:0.2")
  })

  it("renders with neumorphic relief", () => {
    const { container } = render(<SitePage config={NEUMORPHIC_CONFIG} />)
    const styleText = getStyleText(container)
    expect(styleText).toContain("--shape-decorative-pattern")
    expect(styleText).toContain("--arch-surface-shadow")
  })

  it("passes spec to Renderer", () => {
    render(<SitePage config={MINIMAL_CONFIG} />)
    const renderer = screen.getByTestId("json-renderer")
    expect(renderer).toHaveAttribute("data-spec-root", "page")
  })

  it("produces different CSS for different configs", () => {
    const { container: c1 } = render(<SitePage config={ALL_TUNER_CONFIG} />)
    const { container: c2 } = render(<SitePage config={NEUMORPHIC_CONFIG} />)

    const s1 = getStyleText(c1)
    const s2 = getStyleText(c2)

    expect(s1).not.toBe(s2)
    expect(s1).toContain("--tuner-warmth:0.9")
    expect(s2).toContain("--tuner-warmth:0.3")
  })

  it("injects different color bridge CSS when relief changes on same config", () => {
    const { container, rerender } = render(<SitePage config={MINIMAL_CONFIG} />)

    const style1 = getStyleText(container)
    expect(style1).toContain("--color-hero-bg")

    const glassConfig: SiteConfig = {
      ...MINIMAL_CONFIG,
      designLanguage: { ...MINIMAL_CONFIG.designLanguage, relief: "glassmorphic" },
    }
    rerender(<SitePage config={glassConfig} />)

    const style2 = getStyleText(container)
    expect(style2).toContain("--color-hero-bg")
    expect(style1).not.toBe(style2)
  })

  it("merges config.content into spec elements before passing to Renderer", () => {
    const configWithContent: SiteConfig = {
      ...MINIMAL_CONFIG,
      spec: {
        root: "page",
        elements: {
          page: { type: "Container", props: {}, children: ["hero-1"] },
          "hero-1": {
            type: "HeroCentered",
            props: { headline: "Old Headline", subheadline: "Old Sub" },
            children: [],
          },
        },
      },
      content: {
        "hero-headline": "Content-Driven Headline",
        "hero-subheadline": "New Sub",
      },
    }

    render(<SitePage config={configWithContent} />)
    const spec = capturedRendererProps.spec as Record<string, unknown>
    const elements = spec?.elements as Record<string, unknown>
    const hero = elements?.["hero-1"] as Record<string, unknown>
    const props = hero?.props as Record<string, unknown>
    expect(props?.headline).toBe("Content-Driven Headline")
    expect(props?.subheadline).toBe("New Sub")
  })

  it("injects CSS vars via scoped style to override old ThemeProvider", () => {
    const { container } = render(<SitePage config={MINIMAL_CONFIG} />)

    const styles = container.querySelectorAll("style")
    const scopedStyle = Array.from(styles).find((s) =>
      s.textContent?.includes("[data-site-page]"),
    )
    expect(scopedStyle).toBeTruthy()
    expect(scopedStyle!.textContent).toContain("--color-hero-bg")
    expect(scopedStyle!.textContent).toContain("--color-primary")
    expect(scopedStyle!.textContent).toContain("--tuner-warmth")

    const wrapper = container.querySelector("[data-site-page]")
    expect(wrapper).toBeTruthy()
  })
})
