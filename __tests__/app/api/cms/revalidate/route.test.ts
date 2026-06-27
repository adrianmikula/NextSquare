import { describe, expect, it, vi, beforeEach } from "vitest"
import { POST, GET } from "@/app/api/cms/revalidate/route"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

describe("POST /api/cms/revalidate", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 200 with revalidated: true when no secret is configured", async () => {
    vi.stubEnv("CMS_PREVIEW_SECRET", "")
    const request = {
      headers: new Headers(),
      json: async () => ({ paths: ["/about"] }),
    } as any
    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual({ revalidated: true, paths: ["/about"] })
    vi.unstubAllEnvs()
  })

  it("returns 200 when provided secret matches CMS_PREVIEW_SECRET", async () => {
    vi.stubEnv("CMS_PREVIEW_SECRET", "my-secret")
    const request = {
      headers: new Headers([["x-revalidate-secret", "my-secret"]]),
      json: async () => ({}),
    } as any
    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual({ revalidated: true, paths: [] })
    vi.unstubAllEnvs()
  })

  it("returns 401 when secret does not match", async () => {
    vi.stubEnv("CMS_PREVIEW_SECRET", "my-secret")
    const request = {
      headers: new Headers([["x-revalidate-secret", "wrong-secret"]]),
      json: async () => ({}),
    } as any
    const response = await POST(request)
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toEqual({ error: "Unauthorized" })
    vi.unstubAllEnvs()
  })
})

describe("GET /api/cms/revalidate", () => {
  it("returns ok status", async () => {
    const response = await GET()
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual({ status: "ok" })
  })
})
