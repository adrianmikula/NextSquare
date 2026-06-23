import { describe, expect, it, vi, beforeEach } from "vitest"

const mockSendSms = vi.fn()

vi.mock("@/lib/twilio/client", () => ({
  sendSms: mockSendSms,
}))

async function callPost(body: any) {
  const { POST } = await import("@/app/api/twilio/sms/route")
  const request = {
    json: () => Promise.resolve(body),
    headers: { get: () => null },
  }
  return POST(request)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("POST /api/twilio/sms", () => {
  it("sends SMS successfully with valid body", async () => {
    mockSendSms.mockResolvedValue({})
    const response = await callPost({ to: "+61400123456", message: "Your order is ready!" })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(mockSendSms).toHaveBeenCalledWith("+61400123456", "Your order is ready!")
  })

  it("returns 400 when to field is missing", async () => {
    const response = await callPost({ message: "Hello" })
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toContain("Missing required fields")
    expect(mockSendSms).not.toHaveBeenCalled()
  })

  it("returns 400 when message field is missing", async () => {
    const response = await callPost({ to: "+61400123456" })
    expect(response.status).toBe(400)
    expect(mockSendSms).not.toHaveBeenCalled()
  })

  it("returns 400 when both fields are missing", async () => {
    const response = await callPost({})
    expect(response.status).toBe(400)
    expect(mockSendSms).not.toHaveBeenCalled()
  })

  it("returns 500 when sendSms throws", async () => {
    mockSendSms.mockRejectedValue(new Error("Twilio API error"))
    const response = await callPost({ to: "+61400123456", message: "Hi" })
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.error).toBe("Failed to send SMS")
  })
})
