// @vitest-environment node
import { describe, expect, it, vi } from "vitest"
import { GET, POST } from "@/app/api/outstatic/[[...ost]]/route"

vi.mock("outstatic", () => ({
  OutstaticApi: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
}))

describe("Outstatic API route", () => {
  it("exports GET handler from OutstaticApi", () => {
    expect(GET).toBeDefined()
    expect(typeof GET).toBe("function")
  })

  it("exports POST handler from OutstaticApi", () => {
    expect(POST).toBeDefined()
    expect(typeof POST).toBe("function")
  })
})
