// @vitest-environment node
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import robots from "@/app/robots"

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://cafetemplate.com")
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("robots", () => {
  it("allows all user agents with correct disallow", () => {
    const result = robots()
    const rules = result.rules as { userAgent: string; allow: string; disallow: string }
    expect(rules.userAgent).toBe("*")
    expect(rules.allow).toBe("/")
    expect(rules.disallow).toBe("/outstatic/")
  })

  it("generates correct sitemap URL", () => {
    const result = robots()
    expect(result.sitemap).toBe("https://cafetemplate.com/sitemap.xml")
  })
})
