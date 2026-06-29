// @vitest-environment node
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { NextResponse } from "next/server"

const mockDecrypt = vi.fn()

vi.mock("@/lib/auth/session", () => ({
  decrypt: mockDecrypt,
}))

function createRequest(pathname: string, cookieValue?: string): NextRequest {
  const url = new URL(`https://example.com${pathname}`)
  const cookie = cookieValue ? `session=${cookieValue}` : ""
  const request = new Request(url.toString(), {
    headers: {
      cookie,
    },
  })
  return Object.assign(request, {
    nextUrl: url,
    cookies: {
      get: (name: string) =>
        cookieValue && name === "session"
          ? { name, value: cookieValue }
          : undefined,
    },
  }) as NextRequest
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("proxy", () => {
  it("redirects unauthenticated user to /login for /dashboard", async () => {
    mockDecrypt.mockResolvedValue(undefined)

    const { default: proxy } = await import("@/proxy")
    const req = createRequest("/dashboard")
    const res = await proxy(req)

    expect(res.status).toBe(307)
    const location = res.headers.get("location")
    expect(location).toContain("/login")
    expect(location).toContain("redirect=%2Fdashboard")
  })

  it("redirects unauthenticated user for /dashboard/menu", async () => {
    mockDecrypt.mockResolvedValue(undefined)

    const { default: proxy } = await import("@/proxy")
    const req = createRequest("/dashboard/menu")
    const res = await proxy(req)

    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toContain("/login")
  })

  it("allows authenticated user to access /dashboard", async () => {
    mockDecrypt.mockResolvedValue({ userId: "admin" })

    const { default: proxy } = await import("@/proxy")
    const req = createRequest("/dashboard", "valid-token")
    const res = await proxy(req)

    expect(res.status).toBe(200)
  })

  it("redirects authenticated user away from /login to /dashboard", async () => {
    mockDecrypt.mockResolvedValue({ userId: "admin" })

    const { default: proxy } = await import("@/proxy")
    const req = createRequest("/login", "valid-token")
    const res = await proxy(req)

    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toContain("/dashboard")
  })

  it("allows unauthenticated user to access /login", async () => {
    mockDecrypt.mockResolvedValue(undefined)

    const { default: proxy } = await import("@/proxy")
    const req = createRequest("/login")
    const res = await proxy(req)

    expect(res.status).toBe(200)
  })

  it("allows access to public paths without session check", async () => {
    mockDecrypt.mockResolvedValue(undefined)

    const { default: proxy } = await import("@/proxy")
    const req = createRequest("/menu")
    const res = await proxy(req)

    expect(res.status).toBe(200)
  })

  it("allows access to root path", async () => {
    mockDecrypt.mockResolvedValue(undefined)

    const { default: proxy } = await import("@/proxy")
    const req = createRequest("/")
    const res = await proxy(req)

    expect(res.status).toBe(200)
  })

  it("allows authenticated user to access public routes", async () => {
    mockDecrypt.mockResolvedValue({ userId: "admin" })

    const { default: proxy } = await import("@/proxy")
    const req = createRequest("/about", "valid-token")
    const res = await proxy(req)

    expect(res.status).toBe(200)
  })

  it("redirects authenticated user from /login/something to /dashboard", async () => {
    mockDecrypt.mockResolvedValue({ userId: "admin" })

    const { default: proxy } = await import("@/proxy")
    const req = createRequest("/login?redirect=/dashboard/menu", "valid-token")
    const res = await proxy(req)

    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toContain("/dashboard")
  })
})
