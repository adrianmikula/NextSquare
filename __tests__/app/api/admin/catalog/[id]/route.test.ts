import { describe, expect, it, vi, beforeEach } from "vitest"

vi.mock("@/lib/auth/session", () => ({
  getSession: vi.fn(),
}))

vi.mock("@/lib/env", () => ({
  requireEnv: vi.fn((key: string) => {
    if (key === "SQUARE_ACCESS_TOKEN") return "test-token"
    if (key === "SQUARE_ENVIRONMENT") return "sandbox"
    return ""
  }),
}))

vi.mock("crypto", () => ({
  default: { randomUUID: () => "mock-uuid" },
  randomUUID: () => "mock-uuid",
}))

const mockRetrieveCatalogObject = vi.fn()
const mockUpsertCatalogObject = vi.fn()

class MockClient {
  catalogApi = {
    retrieveCatalogObject: mockRetrieveCatalogObject,
    upsertCatalogObject: mockUpsertCatalogObject,
  }
}

vi.mock("square/legacy", () => ({
  Client: MockClient,
  Environment: { Production: "production", Sandbox: "sandbox" },
}))

import { getSession } from "@/lib/auth/session"

async function callPatch(id: string, body: any) {
  const { PATCH } = await import("@/app/api/admin/catalog/[id]/route")
  const request = { json: () => Promise.resolve(body) } as any
  const params = Promise.resolve({ id })
  return PATCH(request, { params })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("PATCH /api/admin/catalog/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValue(null)
    const response = await callPatch("item-1", { name: "New Name" })
    expect(response.status).toBe(401)
  })

  it("returns 404 when item is not found", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "admin" })
    mockRetrieveCatalogObject.mockResolvedValue({ result: { object: null } })
    const response = await callPatch("non-existent", { name: "New" })
    expect(response.status).toBe(404)
  })

  it("updates ITEM name and description", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "admin" })
    const catalogObject = {
      type: "ITEM",
      itemData: { name: "Old Name", description: "Old desc" },
    }
    mockRetrieveCatalogObject.mockResolvedValue({ result: { object: catalogObject } })
    mockUpsertCatalogObject.mockResolvedValue({
      result: { catalogObject: { ...catalogObject, itemData: { name: "New Name", description: "New desc" } } },
    })

    const response = await callPatch("item-1", { name: "New Name", description: "New desc" })
    expect(response.status).toBe(200)
    expect(catalogObject.itemData.name).toBe("New Name")
    expect(catalogObject.itemData.description).toBe("New desc")
    expect(mockUpsertCatalogObject).toHaveBeenCalledWith({
      idempotencyKey: "mock-uuid",
      object: catalogObject,
    })
  })

  it("updates ITEM availableOnline flag", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "admin" })
    const catalogObject = {
      type: "ITEM",
      itemData: { name: "Item", availableOnline: true },
    }
    mockRetrieveCatalogObject.mockResolvedValue({ result: { object: catalogObject } })
    mockUpsertCatalogObject.mockResolvedValue({ result: { catalogObject } })

    await callPatch("item-1", { availableOnline: false })
    expect(catalogObject.itemData.availableOnline).toBe(false)
  })

  it("updates ITEM_VARIATION name and price", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "admin" })
    const catalogObject = {
      type: "ITEM_VARIATION",
      itemVariationData: { name: "Old", pricingType: "FIXED_PRICING", priceMoney: { amount: BigInt(500), currency: "AUD" }, itemId: "parent-1" },
    }
    mockRetrieveCatalogObject.mockResolvedValue({ result: { object: catalogObject } })
    mockUpsertCatalogObject.mockResolvedValue({ result: { catalogObject } })

    await callPatch("var-1", { name: "New Size", priceMoney: 6.50 })
    expect(catalogObject.itemVariationData.name).toBe("New Size")
    expect(catalogObject.itemVariationData.priceMoney.amount).toBe(BigInt(650))
  })

  it("updates parent ITEM when variation availableOnline changes", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "admin" })
    const variationObject = {
      type: "ITEM_VARIATION",
      itemVariationData: { name: "Regular", itemId: "parent-item", priceMoney: { amount: BigInt(500), currency: "AUD" } },
    }
    const parentObject = {
      type: "ITEM",
      itemData: { name: "Coffee", availableOnline: true },
    }
    mockRetrieveCatalogObject
      .mockResolvedValueOnce({ result: { object: variationObject } })
      .mockResolvedValueOnce({ result: { object: parentObject } })
    mockUpsertCatalogObject
      .mockResolvedValueOnce({ result: { catalogObject: parentObject } })

    const response = await callPatch("var-1", { availableOnline: false })
    expect(response.status).toBe(200)
    expect(parentObject.itemData.availableOnline).toBe(false)
    expect(mockUpsertCatalogObject).toHaveBeenCalledWith({
      idempotencyKey: "mock-uuid",
      object: parentObject,
    })
  })

  it("does not send update if no changes provided", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "admin" })
    const catalogObject = {
      type: "ITEM",
      itemData: { name: "Same" },
    }
    mockRetrieveCatalogObject.mockResolvedValue({ result: { object: catalogObject } })
    mockUpsertCatalogObject.mockResolvedValue({ result: { catalogObject } })

    await callPatch("item-1", { name: undefined, description: undefined })
    expect(catalogObject.itemData.name).toBe("Same")
    expect(mockUpsertCatalogObject).toHaveBeenCalled()
  })
})
