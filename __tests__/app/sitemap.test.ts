// @vitest-environment node
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import sitemap from "@/app/sitemap"

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://cafetemplate.com")
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("sitemap", () => {
  it("returns all four routes with correct URLs", () => {
    const result = sitemap()
    expect(result).toHaveLength(4)
    expect(result[0].url).toBe("https://cafetemplate.com")
    expect(result[1].url).toBe("https://cafetemplate.com/menu")
    expect(result[2].url).toBe("https://cafetemplate.com/about")
    expect(result[3].url).toBe("https://cafetemplate.com/contact")
  })

  it("sets correct priorities", () => {
    const result = sitemap()
    expect(result[0].priority).toBe(1)
    expect(result[1].priority).toBe(0.8)
    expect(result[2].priority).toBe(0.5)
    expect(result[3].priority).toBe(0.5)
  })

  it("each entry has a lastModified date", () => {
    const result = sitemap()
    result.forEach((entry) => {
      expect(entry.lastModified).toBeInstanceOf(Date)
    })
  })
})
