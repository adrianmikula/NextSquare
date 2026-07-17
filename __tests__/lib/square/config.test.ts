// @vitest-environment node
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

  it("returns sandbox in development when SQUARE_ENVIRONMENT is not set", async () => {
    delete process.env.SQUARE_ENVIRONMENT
    vi.stubEnv("NODE_ENV", "development")
    vi.resetModules()
    const { getSquareEnvironment } = await import("@/lib/square/config")
    expect(getSquareEnvironment()).toBe("sandbox")
  })

  it("requires SQUARE_ENVIRONMENT in production when not set", async () => {
    delete process.env.SQUARE_ENVIRONMENT
    vi.stubEnv("NODE_ENV", "production")
    vi.resetModules()
    const { getSquareEnvironment } = await import("@/lib/square/config")
    expect(() => getSquareEnvironment()).toThrow("Missing required environment variable: SQUARE_ENVIRONMENT")
  })
})

describe("getSquareDefaultCurrency", () => {
  it("returns AUD when SQUARE_DEFAULT_CURRENCY is not set", async () => {
    const { getSquareDefaultCurrency } = await import("@/lib/square/config")
    expect(getSquareDefaultCurrency()).toBe("AUD")
  })

  it("returns overridden currency when set", async () => {
    vi.stubEnv("SQUARE_DEFAULT_CURRENCY", "USD")
    vi.resetModules()
    const { getSquareDefaultCurrency } = await import("@/lib/square/config")
    expect(getSquareDefaultCurrency()).toBe("USD")
  })
})

describe("getSquareFeeRate", () => {
  it("returns 0.05 when SQUARE_PLATFORM_FEE_RATE is not set", async () => {
    const { getSquareFeeRate } = await import("@/lib/square/config")
    expect(getSquareFeeRate()).toBe(0.05)
  })

  it("returns overridden fee rate when set", async () => {
    vi.stubEnv("SQUARE_PLATFORM_FEE_RATE", "0.075")
    vi.resetModules()
    const { getSquareFeeRate } = await import("@/lib/square/config")
    expect(getSquareFeeRate()).toBe(0.075)
  })

  it("falls back to 0.05 for invalid values", async () => {
    vi.stubEnv("SQUARE_PLATFORM_FEE_RATE", "not-a-number")
    vi.resetModules()
    const { getSquareFeeRate } = await import("@/lib/square/config")
    expect(getSquareFeeRate()).toBe(0.05)
  })
})
