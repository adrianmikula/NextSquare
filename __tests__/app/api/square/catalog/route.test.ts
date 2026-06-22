import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"

const mockFetchMenu = vi.fn()
const mockFetchItemBySlug = vi.fn()

vi.mock("@/lib/square/catalog", () => ({
  fetchMenu: mockFetchMenu,
  fetchItemBySlug: mockFetchItemBySlug,
}))

async function callGet(url: string) {
  const { GET } = await import("@/app/api/square/catalog/route")
  const request = { url } as any
  return GET(request)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("GET /api/square/catalog", () => {
  it("returns full menu with cache headers", async () => {
    mockFetchMenu.mockResolvedValue({
      items: [{ id: "item-1", itemData: { name: "Flat White" } }],
      categories: [{ id: "cat-1", categoryData: { name: "Coffee" } }],
    })
    const response = await callGet("http://localhost/api/square/catalog")
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.items).toHaveLength(1)
    expect(body.items[0].itemData.name).toBe("Flat White")
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=300")
    expect(mockFetchMenu).toHaveBeenCalledOnce()
  })

  it("returns single item when id param is provided", async () => {
    mockFetchItemBySlug.mockResolvedValue({ id: "item-2", itemData: { name: "Latte" } })
    const response = await callGet("http://localhost/api/square/catalog?id=item-2")
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.id).toBe("item-2")
    expect(mockFetchItemBySlug).toHaveBeenCalledWith("item-2")
    expect(mockFetchMenu).not.toHaveBeenCalled()
  })

  it("returns 404 when single item is not found", async () => {
    mockFetchItemBySlug.mockResolvedValue(null)
    const response = await callGet("http://localhost/api/square/catalog?id=non-existent")
    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toContain("not found")
  })

  it("returns 500 when fetchMenu throws", async () => {
    mockFetchMenu.mockRejectedValue(new Error("Square API down"))
    const response = await callGet("http://localhost/api/square/catalog")
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.error).toContain("Failed to fetch menu")
  })

  it("returns 500 when fetchItemBySlug throws", async () => {
    mockFetchItemBySlug.mockRejectedValue(new Error("Network error"))
    const response = await callGet("http://localhost/api/square/catalog?id=item-1")
    expect(response.status).toBe(500)
  })
})
