import { describe, expect, it, beforeEach, afterEach, vi } from "vitest"

beforeEach(() => {
  vi.stubEnv("SQUARE_ACCESS_TOKEN", "test-token")
  vi.stubEnv("SQUARE_ENVIRONMENT", "sandbox")
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe("getSquareApiBase", () => {
  it("returns sandbox URL when environment is sandbox", async () => {
    const { getSquareApiBase } = await import("@/lib/square/config")
    expect(getSquareApiBase()).toBe("https://connect.squareupsandbox.com")
  })

  it("returns production URL when environment is production", async () => {
    vi.stubEnv("SQUARE_ENVIRONMENT", "production")
    vi.resetModules()
    const { getSquareApiBase } = await import("@/lib/square/config")
    expect(getSquareApiBase()).toBe("https://connect.squareup.com")
  })

  it("returns sandbox URL in demo mode regardless of env", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true")
    vi.resetModules()
    const { getSquareApiBase } = await import("@/lib/square/config")
    expect(getSquareApiBase()).toBe("https://connect.squareupsandbox.com")
  })
})

describe("getSquareHeaders", () => {
  it("includes square version and content type", async () => {
    const { getSquareHeaders } = await import("@/lib/square/config")
    const headers = getSquareHeaders()
    expect(headers["Content-Type"]).toBe("application/json")
    expect(headers["Square-Version"]).toBe("2025-01-23")
  })

  it("includes the access token in Authorization header", async () => {
    const { getSquareHeaders } = await import("@/lib/square/config")
    const headers = getSquareHeaders()
    expect(headers.Authorization).toBe("Bearer test-token")
  })

  it("uses empty token in demo mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true")
    vi.resetModules()
    const { getSquareHeaders } = await import("@/lib/square/config")
    const headers = getSquareHeaders()
    expect(headers.Authorization).toBe("Bearer ")
  })
})

describe("getSquareEnvironment", () => {
  it("returns sandbox when SQUARE_ENVIRONMENT is sandbox", async () => {
    const { getSquareEnvironment } = await import("@/lib/square/config")
    expect(getSquareEnvironment()).toBe("sandbox")
  })

  it("returns production when SQUARE_ENVIRONMENT is production", async () => {
    vi.stubEnv("SQUARE_ENVIRONMENT", "production")
    vi.resetModules()
    const { getSquareEnvironment } = await import("@/lib/square/config")
    expect(getSquareEnvironment()).toBe("production")
  })

  it("returns sandbox in demo mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true")
    vi.resetModules()
    const { getSquareEnvironment } = await import("@/lib/square/config")
    expect(getSquareEnvironment()).toBe("sandbox")
  })
})
