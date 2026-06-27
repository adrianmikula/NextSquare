import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"

const mockOutstaticFetch = vi.fn()
const mockWpFetch = vi.fn()

vi.mock("@/lib/cms/adapters/outstatic", () => ({
  OutstaticCmsAdapter: class {
    async listPages() {
      return mockOutstaticFetch("/content/pages")
    }
    async getPage(slug: string) {
      return mockOutstaticFetch(`/content/pages/${slug}`)
    }
    async listMenuItems() {
      return []
    }
    async listBlogPosts() {
      return mockOutstaticFetch("/content/posts")
    }
  },
}))

vi.mock("@/lib/cms/adapters/wordpress", () => ({
  WordPressCmsAdapter: class {
    constructor(private config: Record<string, unknown>) {}
    async listPages() {
      return mockWpFetch("listPages")
    }
    async getPage(slug: string) {
      return mockWpFetch("getPage", slug)
    }
    async listMenuItems() {
      return []
    }
    async listBlogPosts() {
      return mockWpFetch("listBlogPosts")
    }
  },
}))

beforeEach(() => {
  vi.stubEnv("CMS_PROVIDER", "outstatic")
  vi.resetModules()
  mockOutstaticFetch.mockReset()
  mockWpFetch.mockReset()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("getCmsAdapter", () => {
  it("returns OutstaticCmsAdapter by default", async () => {
    const { getCmsAdapter } = await import("@/lib/cms/adapter")
    const adapter = getCmsAdapter()
    expect(adapter).toBeDefined()
    expect(adapter.constructor.name).toBe("OutstaticCmsAdapter")
  })

  it("returns OutstaticCmsAdapter when CMS_PROVIDER is outstatic", async () => {
    vi.stubEnv("CMS_PROVIDER", "outstatic")
    vi.resetModules()
    const { getCmsAdapter } = await import("@/lib/cms/adapter")
    const adapter = getCmsAdapter()
    expect(adapter.constructor.name).toBe("OutstaticCmsAdapter")
  })

  it("returns WordPressCmsAdapter when CMS_PROVIDER is wordpress", async () => {
    vi.stubEnv("CMS_PROVIDER", "wordpress")
    vi.stubEnv("CMS_WORDPRESS_URL", "https://example.com/graphql")
    vi.resetModules()
    const { getCmsAdapter } = await import("@/lib/cms/adapter")
    const adapter = getCmsAdapter()
    expect(adapter.constructor.name).toBe("WordPressCmsAdapter")
  })

  it("throws when WordPress provider is selected without CMS_WORDPRESS_URL", async () => {
    vi.stubEnv("CMS_PROVIDER", "wordpress")
    vi.stubEnv("CMS_WORDPRESS_URL", "")
    vi.resetModules()
    const { getCmsAdapter } = await import("@/lib/cms/adapter")
    expect(() => getCmsAdapter()).toThrow()
    vi.unstubAllEnvs()
  })
})

describe("getCmsProvider", () => {
  it("returns the configured provider", async () => {
    vi.stubEnv("CMS_PROVIDER", "wordpress")
    vi.resetModules()
    const { getCmsProvider } = await import("@/lib/cms/adapter")
    expect(getCmsProvider()).toBe("wordpress")
  })

  it("defaults to outstatic when CMS_PROVIDER is unset", async () => {
    vi.unstubAllEnvs()
    vi.resetModules()
    const { getCmsProvider } = await import("@/lib/cms/adapter")
    expect(getCmsProvider()).toBe("outstatic")
  })
})
