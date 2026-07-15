// @vitest-environment happy-dom
import { describe, expect, it } from "vitest"
import { generateStandaloneHtml } from "@/src/renderer/export"
import type { SiteConfig } from "@/src/schema/site-config"

function makeConfig(overrides: Partial<SiteConfig> = {}): SiteConfig {
  return {
    meta: { name: "Test Site", industry: "test", tone: "test" },
    designLanguage: { relief: "flat", finish: "matte", shape: "squircle" },
    tuners: { warmth: 0.5, density: 0.5, motion: 0.5, contrast: 0.5, narrative: 0.5 },
    spec: { root: "page", elements: {} },
    content: {},
    ...overrides,
  }
}

describe("generateStandaloneHtml", () => {
  it("returns fallback HTML when [data-site-page] not found in DOM", () => {
    const html = generateStandaloneHtml(makeConfig())
    expect(html).toContain("<!DOCTYPE html>")
    expect(html).toContain("Preview content unavailable")
    expect(html).toContain("</html>")
  })

  it("fallback HTML includes the site name in the title", () => {
    const html = generateStandaloneHtml(makeConfig({ meta: { name: "My Awesome Site", industry: "test", tone: "test" } }))
    expect(html).toContain("<title>My Awesome Site</title>")
  })

  it("fallback HTML includes tuner CSS vars", () => {
    const html = generateStandaloneHtml(makeConfig())
    expect(html).toContain("--tuner-warmth")
    expect(html).toContain("--tuner-density")
    expect(html).toContain("--tuner-motion")
    expect(html).toContain("--tuner-contrast")
    expect(html).toContain("--tuner-narrative")
  })

  it("fallback HTML includes shape CSS vars", () => {
    const html = generateStandaloneHtml(makeConfig())
    expect(html).toContain("--shape-corner-radius")
    expect(html).toContain("--shape-button-radius")
    expect(html).toContain("--shape-divider-style")
  })

  it("fallback HTML includes archetype CSS vars", () => {
    const html = generateStandaloneHtml(makeConfig())
    expect(html).toContain("--arch-surface-bg")
    expect(html).toContain("--arch-surface-shadow")
    expect(html).toContain("--arch-card-bg")
    expect(html).toContain("--arch-corner-radius")
  })

  it("fallback HTML includes both :root and [data-site-page] scoped vars", () => {
    const html = generateStandaloneHtml(makeConfig())
    expect(html).toContain(":root{")
    expect(html).toContain("[data-site-page]{")
  })

  it("fallback HTML escapes special characters in the title", () => {
    const html = generateStandaloneHtml(makeConfig({ meta: { name: "Test & Co <3", industry: "test", tone: "test" } }))
    expect(html).toContain("&amp;")
    expect(html).toContain("&lt;")
    expect(html).not.toContain("<3")
  })

  it("fallback HTML defaults title to 'Generated Site' when name missing", () => {
    const config = makeConfig()
    config.meta!.name = undefined as unknown as string
    const html = generateStandaloneHtml(config)
    expect(html).toContain("Generated Site")
  })

  it("fallback HTML contains reset CSS", () => {
    const html = generateStandaloneHtml(makeConfig())
    expect(html).toContain("box-sizing:border-box")
    expect(html).toContain("margin:0")
    expect(html).toContain("padding:0")
  })

  it("produces valid HTML structure", () => {
    const html = generateStandaloneHtml(makeConfig())
    expect(html.startsWith("<!DOCTYPE html>")).toBe(true)
    expect(html).toContain("<html lang=\"en\">")
    expect(html).toContain("</html>")
    expect(html).toContain("<head>")
    expect(html).toContain("</head>")
    expect(html).toContain("<body>")
    expect(html).toContain("</body>")
  })

  it("returns DOM-based HTML when [data-site-page] exists (no crash)", () => {
    const div = document.createElement("div")
    div.setAttribute("data-site-page", "")
    div.textContent = "Hello from DOM"
    document.body.appendChild(div)

    const html = generateStandaloneHtml(makeConfig({
      meta: { name: "DOM Test", industry: "test", tone: "test" },
    }))
    expect(html).toContain("Hello from DOM")

    document.body.removeChild(div)
  })
})
