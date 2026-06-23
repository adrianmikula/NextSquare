// @vitest-environment node
import { describe, expect, it, vi } from "vitest"

vi.mock("outstatic", () => ({
  OutstaticApi: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
}))

describe("Outstatic API route", () => {
  it("exports GET handler from OutstaticApi", async () => {
    const { GET } = await import("@/app/api/outstatic/[[...ost]]/route")
    expect(GET).toBeDefined()
    expect(typeof GET).toBe("function")
  })

  it("exports POST handler from OutstaticApi", async () => {
    const { POST } = await import("@/app/api/outstatic/[[...ost]]/route")
    expect(POST).toBeDefined()
    expect(typeof POST).toBe("function")
  })
})
