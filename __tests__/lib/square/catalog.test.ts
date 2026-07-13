// @vitest-environment node
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { fetchMenu, fetchItemBySlug } from "@/lib/square/catalog"

beforeEach(() => {
  vi.stubEnv("SQUARE_ACCESS_TOKEN", "test-token")
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("fetchMenu", () => {
  it("fetches and parses catalog items with categories and images", async () => {
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
                  description: "Smooth espresso",
                  categoryId: "cat-1",
                  variations: [
                    {
                      id: "var-1",
                      type: "ITEM_VARIATION",
                      itemVariationData: {
                        itemId: "item-1",
                        name: "Regular",
                        pricingType: "FIXED_PRICING",
                        priceMoney: { amount: 550, currency: "AUD" },
                      },
                    },
                  ],
                  ecomImageIds: ["img-1"],
                },
              },
              {
                type: "IMAGE",
                id: "img-1",
                url: "https://example.com/image.png",
              },
            ],
          }),
      })
    )

    const result = await fetchMenu()

    expect(result.items).toHaveLength(1)
    expect(result.items[0].itemData?.name).toBe("Flat White")
    expect(result.items[0].imageUrl).toBe("https://example.com/image.png")
  })

  it("filters out items with availableOnline set to false (86'd)", async () => {
    vi.stubEnv("SQUARE_ENVIRONMENT", "sandbox")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        const isCategory = url.includes("CATEGORY")
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve(
              isCategory
                ? {}
                : {
                    objects: [
                      {
                        type: "ITEM",
                        id: "item-1",
                        itemData: {
                          name: "Available Item",
                          variations: [
                            {
                              id: "var-1",
                              type: "ITEM_VARIATION",
                              itemVariationData: {
                                itemId: "item-1",
                                name: "Regular",
                                pricingType: "FIXED_PRICING",
                              },
                            },
                          ],
                        },
                      },
                      {
                        type: "ITEM",
                        id: "item-2",
                        itemData: {
                          name: "86'd Item",
                          availableOnline: false,
                          variations: [
                            {
                              id: "var-2",
                              type: "ITEM_VARIATION",
                              itemVariationData: {
                                itemId: "item-2",
                                name: "Regular",
                                pricingType: "FIXED_PRICING",
                              },
                            },
                          ],
                        },
                      },
                    ],
                  }
            ),
        })
      })
    )

    const result = await fetchMenu()

    expect(result.items).toHaveLength(1)
    expect(result.items[0].itemData?.name).toBe("Available Item")
  })

  it("returns empty items when catalog has no objects", async () => {
    vi.stubEnv("SQUARE_ENVIRONMENT", "sandbox")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      })
    )

    vi.resetModules()
    const { fetchMenu } = await import("@/lib/square/catalog")
    const result = await fetchMenu()

    expect(result.items).toEqual([])
    expect(result.categories).toEqual([])
  })

  it("throws on API error", async () => {
    vi.stubEnv("SQUARE_ENVIRONMENT", "sandbox")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal Server Error"),
      })
    )

    vi.resetModules()
    const { fetchMenu } = await import("@/lib/square/catalog")
    await expect(fetchMenu()).rejects.toThrow("Square API error")
  })
})

describe("fetchItemBySlug", () => {
  it("returns null on API error", async () => {
    vi.stubEnv("SQUARE_ENVIRONMENT", "sandbox")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Not found"),
      })
    )

    const result = await fetchItemBySlug("nonexistent")
    expect(result).toBeNull()
  })
})
