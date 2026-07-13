// @vitest-environment node
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { encrypt, decrypt } from "@/lib/auth/session"

beforeEach(() => {
  vi.stubEnv("DASHBOARD_PASSWORD", "test-password-123")
  vi.stubEnv("JWT_ALGORITHM", "HS256")
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("session", () => {
  it("encrypts and decrypts a session payload", async () => {
    vi.resetModules()
    const { encrypt, decrypt } = await import("@/lib/auth/session")
    const token = await encrypt({ userId: "admin", roles: ["owner"] })
    expect(token).toBeTruthy()
    expect(typeof token).toBe("string")

    const payload = await decrypt(token)
    expect(payload?.userId).toBe("admin")
  })

  it("returns undefined for invalid token", async () => {
    const payload = await decrypt("invalid-token")
    expect(payload).toBeUndefined()
  })

  it("returns undefined for empty token", async () => {
    const payload = await decrypt("")
    expect(payload).toBeUndefined()
  })

  it("returns undefined for undefined token", async () => {
    const payload = await decrypt(undefined)
    expect(payload).toBeUndefined()
  })
})
