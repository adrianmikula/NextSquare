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

const mockRetrieveCatalogObject = vi.fn()
const mockSearchCatalogItems = vi.fn()

class MockClient {
  catalogApi = {
    retrieveCatalogObject: mockRetrieveCatalogObject,
    searchCatalogItems: mockSearchCatalogItems,
  }
}

vi.mock("square/legacy", () => ({
  Client: MockClient,
  Environment: { Production: "production", Sandbox: "sandbox" },
}))

import { getSession } from "@/lib/auth/session"

async function callGet(url: string) {
  const { GET } = await import("@/app/api/admin/catalog/route")
  const request = { url, headers: { get: () => null } } as any
  return GET(request)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("GET /api/admin/catalog", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValue(null)
    const response = await callGet("http://localhost/api/admin/catalog")
    expect(response.status).toBe(401)
  })

  it("returns 403 when visitor role only", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "admin", roles: ["visitor"] })
    const response = await callGet("http://localhost/api/admin/catalog")
    expect(response.status).toBe(403)
  })

  it("returns 403 when visitor role only", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "admin", roles: ["visitor"] })
    const response = await callGet("http://localhost/api/admin/catalog")
    expect(response.status).toBe(403)
  })

  it("allows staff to view catalog", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "admin", roles: ["staff"] })
    mockSearchCatalogItems.mockResolvedValue({
      result: {
        items: [
          { id: "item-1", itemData: { name: "Flat White" } },
        ],
        length: 1,
      },
    })
    const response = await callGet("http://localhost/api/admin/catalog")
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.items).toHaveLength(1)
  })

  it("returns all catalog items", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "admin", roles: ["owner"] })
    mockSearchCatalogItems.mockResolvedValue({
      result: {
        items: [
          { id: "item-1", itemData: { name: "Flat White" } },
          { id: "item-2", itemData: { name: "Latte" } },
        ],
        length: 2,
      },
    })
    const response = await callGet("http://localhost/api/admin/catalog")
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.items).toHaveLength(2)
    expect(body.count).toBe(2)
  })

  it("returns empty array when no items exist", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "admin", roles: ["owner"] })
    mockSearchCatalogItems.mockResolvedValue({ result: {} })
    const response = await callGet("http://localhost/api/admin/catalog")
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.items).toEqual([])
    expect(body.count).toBe(0)
  })

  it("returns single item by id when id param is present", async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: "admin", roles: ["owner"] })
    mockRetrieveCatalogObject.mockResolvedValue({
      result: { object: { id: "item-1", itemData: { name: "Flat White" } } },
    })
    const response = await callGet("http://localhost/api/admin/catalog?id=item-1")
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.id).toBe("item-1")
    expect(mockRetrieveCatalogObject).toHaveBeenCalledWith("item-1", true)
    expect(mockSearchCatalogItems).not.toHaveBeenCalled()
  })
})
