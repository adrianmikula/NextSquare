// @vitest-environment node
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"

const mockStoreMfaCode = vi.fn()
const mockGetMfaKey = vi.fn(() => "mfa:test-ip")
const mockSendSms = vi.fn()
const mockRateLimit = vi.fn(() => ({ allowed: true }))
const mockGetRateLimitResponse = vi.fn(() => new Response("Too Many Requests", { status: 429 }))

vi.mock("@/lib/auth/mfa", () => ({
  storeMfaCode: mockStoreMfaCode,
  getMfaKey: mockGetMfaKey,
}))

vi.mock("@/lib/twilio/client", () => ({
  sendSms: mockSendSms,
}))

vi.mock("@/lib/security/rate-limit", () => ({
  rateLimit: mockRateLimit,
  getRateLimitResponse: mockGetRateLimitResponse,
}))

const mockSearchTeamMembers = vi.fn()

class MockClient {
  teamApi = {
    searchTeamMembers: mockSearchTeamMembers,
  }
}

vi.mock("square/legacy", () => ({
  Client: MockClient,
  Environment: { Production: "production", Sandbox: "sandbox" },
}))

function expectMfaCall(calls: unknown[][], expectedRole: string, expectedSquareRequired: boolean) {
  const call = calls[0]
  expect(call[0]).toBe("mfa:test-ip")
  expect(call[1]).toMatch(/^\d{6}$/)
  expect(call[2]).toBe("test-ip")
  expect(call[3]).toBe(300)
  expect(call[4]).toBe(expectedRole)
  expect(call[5]).toBe(expectedSquareRequired)
}

async function callPost(body: object) {
  const { POST } = await import("@/app/api/auth/challenge/route")
  const request = {
    json: () => Promise.resolve(body),
    headers: { get: () => "test-ip" },
  }
  return POST(request as any)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv("DASHBOARD_PASSWORD", "correct-horse")
  vi.stubEnv("DASHBOARD_ADMIN_PHONE", "+61400000000")
  vi.stubEnv("SQUARE_ACCESS_TOKEN", "test-token")
  vi.stubEnv("SQUARE_ENVIRONMENT", "sandbox")
  mockRateLimit.mockReturnValue({ allowed: true })
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("POST /api/auth/challenge", () => {
  it("returns 401 when password is missing", async () => {
    const response = await callPost({})
    expect(response.status).toBe(401)
  })

  it("returns 401 when password is wrong", async () => {
    const response = await callPost({ password: "wrong" })
    expect(response.status).toBe(401)
  })

  it("sends SMS and stores challenge with owner role by default", async () => {
    const response = await callPost({ password: "correct-horse" })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ challenge: true })
    expect(mockSendSms).toHaveBeenCalled()
    expectMfaCall(mockStoreMfaCode.mock.calls, "owner", false)
  })

  it("assigns owner role from Square isOwner flag", async () => {
    vi.stubEnv("DASHBOARD_ADMIN_EMAIL", "owner@example.com")
    mockSearchTeamMembers.mockResolvedValue({
      result: {
        teamMembers: [
          { emailAddress: "owner@example.com", isOwner: true },
        ],
      },
    })
    const response = await callPost({ password: "correct-horse" })
    expect(response.status).toBe(200)
    expectMfaCall(mockStoreMfaCode.mock.calls, "owner", true)
  })

  it("assigns staff role from Square non-owner member", async () => {
    vi.stubEnv("DASHBOARD_ADMIN_EMAIL", "staff@example.com")
    mockSearchTeamMembers.mockResolvedValue({
      result: {
        teamMembers: [
          { emailAddress: "staff@example.com", isOwner: false },
        ],
      },
    })
    const response = await callPost({ password: "correct-horse" })
    expect(response.status).toBe(200)
    expectMfaCall(mockStoreMfaCode.mock.calls, "staff", true)
  })

  it("assigns visitor role when email not found in Square", async () => {
    vi.stubEnv("DASHBOARD_ADMIN_EMAIL", "unknown@example.com")
    mockSearchTeamMembers.mockResolvedValue({
      result: {
        teamMembers: [],
      },
    })
    const response = await callPost({ password: "correct-horse" })
    expect(response.status).toBe(200)
    expectMfaCall(mockStoreMfaCode.mock.calls, "visitor", true)
  })

  it("assigns developer role when email is in developer list", async () => {
    vi.stubEnv("DASHBOARD_ADMIN_EMAIL", "dev@example.com")
    vi.stubEnv("DASHBOARD_DEVELOPER_EMAILS", "dev@example.com")
    const response = await callPost({ password: "correct-horse" })
    expect(response.status).toBe(200)
    expectMfaCall(mockStoreMfaCode.mock.calls, "developer", false)
    expect(mockSearchTeamMembers).not.toHaveBeenCalled()
  })

  it("defaults to owner role when no DASHBOARD_ADMIN_EMAIL is set", async () => {
    const response = await callPost({ password: "correct-horse" })
    expect(response.status).toBe(200)
    expectMfaCall(mockStoreMfaCode.mock.calls, "owner", false)
    expect(mockSearchTeamMembers).not.toHaveBeenCalled()
  })

  it("returns 503 when Square API fails", async () => {
    vi.stubEnv("DASHBOARD_ADMIN_EMAIL", "owner@example.com")
    mockSearchTeamMembers.mockRejectedValue(new Error("Square API error"))
    const response = await callPost({ password: "correct-horse" })
    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({
      error: "Authentication service temporarily unavailable. Please try again later.",
    })
    expect(mockSendSms).not.toHaveBeenCalled()
    expect(mockStoreMfaCode).not.toHaveBeenCalled()
  })

  it("returns 500 when SMS sending fails", async () => {
    mockSendSms.mockRejectedValue(new Error("Twilio error"))
    const response = await callPost({ password: "correct-horse" })
    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({
      error: "Failed to send verification code. Please try again.",
    })
  })

  it("respects rate limiting", async () => {
    mockRateLimit.mockReturnValue({ allowed: false, retryAfter: 30 })
    const response = await callPost({ password: "correct-horse" })
    expect(response.status).toBe(429)
    expect(mockGetRateLimitResponse).toHaveBeenCalledWith(30)
  })
})
