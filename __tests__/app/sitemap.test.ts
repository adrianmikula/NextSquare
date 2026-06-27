import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"

const mockGetCmsAdapter = vi.fn()

vi.mock("@/lib/cms/adapter", () => ({
  getCmsAdapter: () => mockGetCmsAdapter(),
}))

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://cafetemplate.com")
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("sitemap", () => {
  beforeEach(() => {
    mockGetCmsAdapter.mockReturnValue({
      listBlogPosts: vi.fn().mockResolvedValue([]),
    })
  })

  it("returns all routes with correct URLs", async () => {
    const sitemap = (await import("@/app/sitemap")).default
    const result = await sitemap()
    expect(result).toHaveLength(5)
    expect(result[0].url).toBe("https://cafetemplate.com")
    expect(result[1].url).toBe("https://cafetemplate.com/menu")
    expect(result[2].url).toBe("https://cafetemplate.com/about")
    expect(result[3].url).toBe("https://cafetemplate.com/contact")
    expect(result[4].url).toBe("https://cafetemplate.com/blog")
  })

  it("sets correct priorities", async () => {
    const sitemap = (await import("@/app/sitemap")).default
    const result = await sitemap()
    expect(result[0].priority).toBe(1)
    expect(result[1].priority).toBe(0.8)
    expect(result[2].priority).toBe(0.5)
    expect(result[3].priority).toBe(0.5)
    expect(result[4].priority).toBe(0.7)
  })

  it("each entry has a lastModified date", async () => {
    const sitemap = (await import("@/app/sitemap")).default
    const result = await sitemap()
    result.forEach((entry) => {
      expect(entry.lastModified).toBeInstanceOf(Date)
    })
  })
})
