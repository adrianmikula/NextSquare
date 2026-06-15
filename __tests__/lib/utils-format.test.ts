import { describe, expect, it } from "vitest"
import { formatCurrency, formatPhone } from "@/lib/utils"

describe("formatCurrency", () => {
  it("formats AUD amounts correctly", () => {
    expect(formatCurrency(550)).toBe("$5.50")
    expect(formatCurrency(1000)).toBe("$10.00")
    expect(formatCurrency(1)).toBe("$0.01")
  })

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00")
  })

  it("formats large amounts", () => {
    expect(formatCurrency(150050)).toBe("$1,500.50")
  })
})

describe("formatPhone", () => {
  it("formats Australian mobile numbers", () => {
    expect(formatPhone("0412345678")).toBe("+61412345678")
  })

  it("passes through already-formatted numbers", () => {
    expect(formatPhone("+61412345678")).toBe("+61412345678")
  })

  it("handles numbers with spaces", () => {
    expect(formatPhone("0412 345 678")).toBe("+61412345678")
  })
})
