// @vitest-environment node
import { describe, expect, it } from "vitest"
import manifest from "@/app/manifest"

describe("manifest", () => {
  it("returns PWA manifest with correct metadata", () => {
    const result = manifest()
    expect(result.name).toBe("Aydin's Cafe")
    expect(result.short_name).toBe("Aydin's")
    expect(result.description).toBe("Aydin's Cafe in Joondalup serves fresh breakfast and brunch. Known for burgers made fresh, tasty chips, and hearty breakfast classics.")
    expect(result.start_url).toBe("/")
    expect(result.display).toBe("standalone")
    expect(result.background_color).toBe("#ffffff")
    expect(result.theme_color).toBe("#d97706")
  })
})
