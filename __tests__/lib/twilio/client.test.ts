// @vitest-environment node
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { sendSms } from "@/lib/twilio/client"

const mockCreate = vi.fn()

vi.mock("twilio", () => ({
  Twilio: vi.fn(function () {
    return { messages: { create: mockCreate } }
  }),
}))

beforeEach(() => {
  vi.stubEnv("TWILIO_ACCOUNT_SID", "test-sid")
  vi.stubEnv("TWILIO_AUTH_TOKEN", "test-token")
  vi.stubEnv("TWILIO_PHONE_NUMBER", "+15551234567")
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe("sendSms", () => {
  it("sends an SMS with correct parameters", async () => {
    mockCreate.mockResolvedValue({ sid: "SM123" })
    const result = await sendSms("+15559876543", "Hello from the cafe!")
    expect(mockCreate).toHaveBeenCalledWith({
      body: "Hello from the cafe!",
      from: "+15551234567",
      to: "+15559876543",
    })
    expect(result).toEqual({ sid: "SM123" })
  })

  it("throws when Twilio API fails", async () => {
    mockCreate.mockRejectedValue(new Error("Twilio error"))
    await expect(sendSms("+15559876543", "test")).rejects.toThrow("Twilio error")
  })
})
