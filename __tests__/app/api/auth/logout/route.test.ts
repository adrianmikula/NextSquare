// @vitest-environment node
import { describe, expect, it, vi, beforeEach } from "vitest"

const mockDeleteSession = vi.fn()

vi.mock("@/lib/auth/session", () => ({
  deleteSession: mockDeleteSession,
}))

async function callPost() {
  const { POST } = await import("@/app/api/auth/logout/route")
  return POST()
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("POST /api/auth/logout", () => {
  it("returns 200 with success true", async () => {
    mockDeleteSession.mockResolvedValue(undefined)
    const response = await callPost()
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })

  it("calls deleteSession", async () => {
    mockDeleteSession.mockResolvedValue(undefined)
    await callPost()
    expect(mockDeleteSession).toHaveBeenCalled()
  })
})
