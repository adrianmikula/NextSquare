// @vitest-environment node
import { describe, expect, it, beforeEach, afterEach } from "vitest"
import { requireEnv } from "@/lib/env"

const ORIGINAL = { ...process.env }

beforeEach(() => {
  process.env = { ...ORIGINAL }
})

afterEach(() => {
  process.env = ORIGINAL
})

describe("requireEnv", () => {
  it("returns the value when the env var is set", () => {
    process.env.TEST_VAR = "hello"
    expect(requireEnv("TEST_VAR")).toBe("hello")
  })

  it("throws when the env var is missing", () => {
    delete process.env.TEST_VAR
    expect(() => requireEnv("TEST_VAR")).toThrow(
      "Missing required environment variable: TEST_VAR"
    )
  })

  it("throws when the env var is an empty string", () => {
    process.env.TEST_VAR = ""
    expect(() => requireEnv("TEST_VAR")).toThrow(
      "Missing required environment variable: TEST_VAR"
    )
  })

  it("includes remediation instructions in the error message", () => {
    delete process.env.TEST_VAR
    expect(() => requireEnv("TEST_VAR")).toThrow(
      "Add it to your .env.local file"
    )
  })

  it("throws when the env var key does not exist", () => {
    expect(() => requireEnv("THIS_KEY_DOES_NOT_EXIST_XYZ")).toThrow(
      "Missing required environment variable: THIS_KEY_DOES_NOT_EXIST_XYZ"
    )
  })
})
