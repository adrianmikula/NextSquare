// @vitest-environment node
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"

const mockCreateSession = vi.fn()
const mockSearchTeamMembers = vi.fn()

vi.mock("@/lib/auth/session", () => ({
  createSession: mockCreateSession,
}))

class MockClient {
  teamApi = {
    searchTeamMembers: mockSearchTeamMembers,
  }
}

vi.mock("square/legacy", () => ({
  Client: MockClient,
  Environment: { Production: "production", Sandbox: "sandbox" },
}))

async function callPost(body: object) {
  const { POST } = await import("@/app/api/auth/login/route")
  const request = {
    json: () => Promise.resolve(body),
    headers: { get: () => null },
  }
  return POST(request as any)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv("DASHBOARD_PASSWORD", "correct-horse")
  vi.stubEnv("SQUARE_ACCESS_TOKEN", "test-token")
  vi.stubEnv("SQUARE_ENVIRONMENT", "sandbox")
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

  it("defaults to owner role when no DASHBOARD_ADMIN_EMAIL is set", async () => {
    mockCreateSession.mockResolvedValue(undefined)
    vi.stubEnv("DASHBOARD_PASSWORD", "secret")
    const response = await callPost({ password: "secret" })
    expect(response.status).toBe(200)
    expect(mockCreateSession).toHaveBeenCalledWith(["owner"])
  })

  it("assigns owner role when Square member isOwner is true", async () => {
    mockCreateSession.mockResolvedValue(undefined)
    vi.stubEnv("DASHBOARD_PASSWORD", "secret")
    vi.stubEnv("DASHBOARD_ADMIN_EMAIL", "owner@example.com")
    mockSearchTeamMembers.mockResolvedValue({
      result: {
        teamMembers: [
          { emailAddress: "owner@example.com", isOwner: true },
        ],
      },
    })
    const response = await callPost({ password: "secret" })
    expect(response.status).toBe(200)
    expect(mockCreateSession).toHaveBeenCalledWith(["owner"])
  })

  it("assigns staff role when Square member isOwner is false", async () => {
    mockCreateSession.mockResolvedValue(undefined)
    vi.stubEnv("DASHBOARD_PASSWORD", "secret")
    vi.stubEnv("DASHBOARD_ADMIN_EMAIL", "staff@example.com")
    mockSearchTeamMembers.mockResolvedValue({
      result: {
        teamMembers: [
          { emailAddress: "staff@example.com", isOwner: false },
        ],
      },
    })
    const response = await callPost({ password: "secret" })
    expect(response.status).toBe(200)
    expect(mockCreateSession).toHaveBeenCalledWith(["staff"])
  })

  it("assigns visitor role when email is not in Square team", async () => {
    mockCreateSession.mockResolvedValue(undefined)
    vi.stubEnv("DASHBOARD_PASSWORD", "secret")
    vi.stubEnv("DASHBOARD_ADMIN_EMAIL", "unknown@example.com")
    mockSearchTeamMembers.mockResolvedValue({
      result: {
        teamMembers: [],
      },
    })
    const response = await callPost({ password: "secret" })
    expect(response.status).toBe(200)
    expect(mockCreateSession).toHaveBeenCalledWith(["visitor"])
  })

  it("assigns developer role when email is in DASHBOARD_DEVELOPER_EMAILS", async () => {
    mockCreateSession.mockResolvedValue(undefined)
    vi.stubEnv("DASHBOARD_PASSWORD", "secret")
    vi.stubEnv("DASHBOARD_ADMIN_EMAIL", "dev@example.com")
    vi.stubEnv("DASHBOARD_DEVELOPER_EMAILS", "dev@example.com")
    const response = await callPost({ password: "secret" })
    expect(response.status).toBe(200)
    expect(mockCreateSession).toHaveBeenCalledWith(["developer"])
  })

  it("returns 503 when Square API fails", async () => {
    mockCreateSession.mockResolvedValue(undefined)
    vi.stubEnv("DASHBOARD_PASSWORD", "secret")
    vi.stubEnv("DASHBOARD_ADMIN_EMAIL", "owner@example.com")
    mockSearchTeamMembers.mockRejectedValue(new Error("Square API error"))
    const response = await callPost({ password: "secret" })
    expect(response.status).toBe(503)
    expect(mockCreateSession).not.toHaveBeenCalled()
    const data = await response.json()
    expect(data.error).toContain("temporarily unavailable")
  })

  it("does not call createSession on wrong password", async () => {
    vi.stubEnv("DASHBOARD_PASSWORD", "secret")
    await callPost({ password: "wrong" })
    expect(mockCreateSession).not.toHaveBeenCalled()
  })
})
