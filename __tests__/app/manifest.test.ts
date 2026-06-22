import { describe, expect, it } from "vitest"

describe("manifest", () => {
  it("returns PWA manifest with correct metadata", async () => {
    const manifest = (await import("@/app/manifest")).default
    const result = manifest()
    expect(result.name).toBe("Cafe Template")
    expect(result.short_name).toBe("Cafe")
    expect(result.description).toBe("Fresh coffee, great food, and a warm atmosphere.")
    expect(result.start_url).toBe("/")
    expect(result.display).toBe("standalone")
    expect(result.background_color).toBe("#ffffff")
    expect(result.theme_color).toBe("#d97706")
  })
})
