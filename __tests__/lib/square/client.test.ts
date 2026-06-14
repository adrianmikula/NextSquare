import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"

beforeEach(() => {
  vi.stubEnv("SQUARE_ACCESS_TOKEN", "test-token")
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("fetchCatalog", () => {
  it("fetches and parses catalog items", async () => {
    vi.stubEnv("SQUARE_ENVIRONMENT", "sandbox")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            objects: [
              {
                type: "ITEM",
                id: "item-1",
                itemData: {
                  name: "Flat White",
                  description: "Smooth espresso drink",
                  variations: [
                    {
                      itemVariationData: {
                        priceMoney: { amount: 500, currency: "USD" },
                      },
                    },
                  ],
                },
              },
              {
                type: "ITEM",
                id: "item-2",
                itemData: {
                  name: "Cold Brew",
                  variations: [],
                },
              },
              {
                type: "CATEGORY",
                id: "cat-1",
                itemData: { name: "Beverages" },
              },
            ],
          }),
      })
    )

    const { fetchCatalog } = await import("@/lib/square/client")
    const items = await fetchCatalog()
    expect(items).toHaveLength(2)
    expect(items[0]).toEqual({
      id: "item-1",
      name: "Flat White",
      description: "Smooth espresso drink",
      priceMoney: { amount: BigInt(500), currency: "USD" },
      categoryName: undefined,
      imageUrl: undefined,
    })
    expect(items[1]).toEqual({
      id: "item-2",
      name: "Cold Brew",
      description: undefined,
      priceMoney: undefined,
      categoryName: undefined,
      imageUrl: undefined,
    })
  })

  it("uses production URL when environment is production", async () => {
    vi.stubEnv("SQUARE_ENVIRONMENT", "production")
    let capturedUrl = ""
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        capturedUrl = url
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ objects: [] }),
        })
      })
    )
    vi.resetModules()
    const { fetchCatalog } = await import("@/lib/square/client")
    await fetchCatalog()
    expect(capturedUrl).toContain("connect.squareup.com")
  })

  it("throws on non-OK response", async () => {
    vi.stubEnv("SQUARE_ENVIRONMENT", "sandbox")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })
    )
    const { fetchCatalog } = await import("@/lib/square/client")
    await expect(fetchCatalog()).rejects.toThrow("Square API error: 500")
  })

  it("returns empty array when no objects returned", async () => {
    vi.stubEnv("SQUARE_ENVIRONMENT", "sandbox")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      })
    )
    const { fetchCatalog } = await import("@/lib/square/client")
    const items = await fetchCatalog()
    expect(items).toEqual([])
  })
})

describe("fetchLocation", () => {
  it("returns empty object when SQUARE_LOCATION_ID is not set", async () => {
    const { fetchLocation } = await import("@/lib/square/client")
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
    const { fetchLocation } = await import("@/lib/square/client")
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
    const { fetchLocation } = await import("@/lib/square/client")
    const result = await fetchLocation()
    expect(result).toEqual({})
  })
})
