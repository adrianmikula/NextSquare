// @vitest-environment node
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"

beforeEach(() => {
  vi.unstubAllEnvs()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

async function importConfig(stubs?: Record<string, string>) {
  if (stubs) {
    for (const [key, value] of Object.entries(stubs)) {
      vi.stubEnv(key, value)
    }
  }
  vi.resetModules()
  return import("@/lib/demo/config")
}

describe("isDemoMode", () => {
  it("returns false when env var is not set", async () => {
    const { isDemoMode } = await importConfig()
    expect(isDemoMode()).toBe(false)
  })

  it("returns false when env var is not 'true'", async () => {
    const { isDemoMode } = await importConfig({ NEXT_PUBLIC_DEMO_MODE: "false" })
    expect(isDemoMode()).toBe(false)
  })

  it("returns true when env var is 'true'", async () => {
    const { isDemoMode } = await importConfig({ NEXT_PUBLIC_DEMO_MODE: "true" })
    expect(isDemoMode()).toBe(true)
  })
})

describe("requireDemoMode", () => {
  it("throws when not in demo mode", async () => {
    const { requireDemoMode } = await importConfig()
    expect(() => requireDemoMode()).toThrow("This operation is only available in demo mode")
  })

  it("does not throw when in demo mode", async () => {
    const { requireDemoMode } = await importConfig({ NEXT_PUBLIC_DEMO_MODE: "true" })
    expect(() => requireDemoMode()).not.toThrow()
  })
})
