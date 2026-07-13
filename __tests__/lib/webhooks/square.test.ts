// @vitest-environment node
import { createHash } from "node:crypto"
import { describe, expect, it, beforeEach, afterEach } from "vitest"
import { verifySquareWebhook, parseWebhookEvent } from "@/lib/webhooks/square"

function computeSignature(body: string, key: string): string {
  const hmac = createHash("sha256")
  hmac.update(key)
  hmac.update(body)
  return hmac.digest("hex")
}

describe("verifySquareWebhook", () => {
  beforeEach(() => {
    process.env.SQUARE_WEBHOOK_SIGNATURE_KEY = "test-secret-key"
  })

  afterEach(() => {
    delete process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
  })

  it("returns false when SQUARE_WEBHOOK_SIGNATURE_KEY is not set", () => {
    delete process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
    expect(verifySquareWebhook("body", "sig")).toBe(false)
  })

  it("returns true for a valid signature", () => {
    const body = JSON.stringify({ type: "order.updated" })
    const sig = computeSignature(body, "test-secret-key")
    expect(verifySquareWebhook(body, sig)).toBe(true)
  })

  it("returns false for an invalid signature", () => {
    const body = JSON.stringify({ type: "order.updated" })
    expect(verifySquareWebhook(body, "wrong-signature")).toBe(false)
  })

  it("returns false when signature length differs", () => {
    const body = JSON.stringify({ type: "order.updated" })
    const sig = computeSignature(body, "test-secret-key")
    expect(verifySquareWebhook(body, sig + "extra")).toBe(false)
  })

  it("returns false when body has been tampered", () => {
    const body = JSON.stringify({ type: "order.updated" })
    const sig = computeSignature(body, "test-secret-key")
    const tamperedBody = JSON.stringify({ type: "order.canceled" })
    expect(verifySquareWebhook(tamperedBody, sig)).toBe(false)
  })
})

describe("parseWebhookEvent", () => {
  it("parses a valid webhook event", () => {
    const body = JSON.stringify({
      type: "order.updated",
      data: {
        object: {
          order: {
            id: "order-123",
            ticketName: "T-42",
          },
        },
      },
    })
    const result = parseWebhookEvent(body)
    expect(result).toEqual({
      type: "order.updated",
      data: { object: { order: { id: "order-123", ticketName: "T-42" } } },
    })
  })

  it("returns null for invalid JSON", () => {
    expect(parseWebhookEvent("not-json")).toBeNull()
  })

  it("returns null for empty string", () => {
    expect(parseWebhookEvent("")).toBeNull()
  })
})
