// @vitest-environment node
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { fetchLocation } from "@/lib/square/client"

beforeEach(() => {
  vi.stubEnv("SQUARE_ACCESS_TOKEN", "test-token")
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("fetchLocation", () => {
  it("returns empty object when SQUARE_LOCATION_ID is not set", async () => {
    const result = await fetchLocation()
    expect(result).toEqual({})
  })

  it("fetches location data when ID is set", async () => {
    vi.stubEnv("SQUARE_LOCATION_ID", "loc-123")
    vi.stubEnv("SQUARE_ENVIRONMENT", "sandbox")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            address: {
              addressLine1: "123 Coffee St",
              city: "Melbourne",
              state: "VIC",
              postalCode: "3000",
            },
            timezone: "Australia/Melbourne",
          }),
      })
    )
    const result = await fetchLocation()
    expect(result).toEqual({
      address: {
        addressLine1: "123 Coffee St",
        city: "Melbourne",
        state: "VIC",
        postalCode: "3000",
      },
      timezone: "Australia/Melbourne",
    })
  })

  it("returns empty object on API error", async () => {
    vi.stubEnv("SQUARE_LOCATION_ID", "loc-123")
    vi.stubEnv("SQUARE_ENVIRONMENT", "sandbox")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      })
    )
    const result = await fetchLocation()
    expect(result).toEqual({})
  })
})
