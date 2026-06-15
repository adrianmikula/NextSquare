// @vitest-environment node
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"

const mockCreateSession = vi.fn()

vi.mock("@/lib/auth/session", () => ({
  createSession: mockCreateSession,
}))

async function callPost(body: object) {
  const { POST } = await import("@/app/api/auth/login/route")
  const request = {
    json: () => Promise.resolve(body),
  }
  return POST(request as any)
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("POST /api/auth/login", () => {
  it("returns 401 when password is missing", async () => {
    const response = await callPost({})
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe("Invalid password")
  })

  it("returns 401 when password is empty string", async () => {
    const response = await callPost({ password: "" })
    expect(response.status).toBe(401)
  })

  it("returns 401 when password does not match", async () => {
    vi.stubEnv("DASHBOARD_PASSWORD", "correct-horse")
    const response = await callPost({ password: "wrong-password" })
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe("Invalid password")
  })

  it("returns 200 and creates session on correct password", async () => {
    mockCreateSession.mockResolvedValue(undefined)
    vi.stubEnv("DASHBOARD_PASSWORD", "correct-horse")
    const response = await callPost({ password: "correct-horse" })
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })

  it("calls createSession on successful login", async () => {
    mockCreateSession.mockResolvedValue(undefined)
    vi.stubEnv("DASHBOARD_PASSWORD", "secret")
    await callPost({ password: "secret" })
    expect(mockCreateSession).toHaveBeenCalled()
  })

  it("does not call createSession on wrong password", async () => {
    vi.stubEnv("DASHBOARD_PASSWORD", "secret")
    await callPost({ password: "wrong" })
    expect(mockCreateSession).not.toHaveBeenCalled()
  })
})
