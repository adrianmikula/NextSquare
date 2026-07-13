import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { POST } from "@/app/api/square/webhook/route"

const { mockVerify, mockParse, mockSendSms } = vi.hoisted(() => ({ mockVerify: vi.fn(), mockParse: vi.fn(), mockSendSms: vi.fn() }))

vi.mock("@/lib/webhooks/square", () => ({
  verifySquareWebhook: mockVerify,
  parseWebhookEvent: mockParse,
}))

vi.mock("@/lib/twilio/client", () => ({
  sendSms: mockSendSms,
}))

function callPost(body: string, signatureHeader?: string) {
  const headers = new Headers()
  if (signatureHeader !== undefined) {
    headers.set("x-square-hmacsha256-signature", signatureHeader)
  }
  const request = { text: () => Promise.resolve(body), headers } as any
  return POST(request)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("POST /api/square/webhook", () => {
  it("returns 401 when signature is invalid", async () => {
    mockVerify.mockReturnValue(false)
    const response = await callPost("{}", "bad-sig")
    expect(response.status).toBe(401)
    expect(await response.text()).toBe("Invalid signature")
    expect(mockSendSms).not.toHaveBeenCalled()
  })

  it("returns 400 when event body is not valid JSON", async () => {
    mockVerify.mockReturnValue(true)
    mockParse.mockReturnValue(null)
    const response = await callPost("not-json", "sig")
    expect(response.status).toBe(400)
    expect(await response.text()).toBe("Invalid event")
    expect(mockSendSms).not.toHaveBeenCalled()
  })

  it("returns 200 for non-order.updated events", async () => {
    mockVerify.mockReturnValue(true)
    mockParse.mockReturnValue({ type: "catalog.version.updated", data: { object: { order: { id: "o1" } } } })
    const response = await callPost("{}", "sig")
    expect(response.status).toBe(200)
    expect(await response.text()).toBe("OK")
    expect(mockSendSms).not.toHaveBeenCalled()
  })

  it("returns 200 when order has no fulfillment phone number", async () => {
    mockVerify.mockReturnValue(true)
    mockParse.mockReturnValue({
      type: "order.updated",
      data: {
        object: {
          order: {
            id: "o1",
            fulfillments: [{ state: "PROPOSED", pickupDetails: { recipient: {} } }],
          },
        },
      },
    })
    const response = await callPost("{}", "sig")
    expect(response.status).toBe(200)
    expect(await response.text()).toBe("No phone number")
    expect(mockSendSms).not.toHaveBeenCalled()
  })

  it("sends PROPOSED SMS and returns 200", async () => {
    mockVerify.mockReturnValue(true)
    mockParse.mockReturnValue({
      type: "order.updated",
      data: {
        object: {
          order: {
            id: "o1",
            ticketName: "T-42",
            fulfillments: [
              { state: "PROPOSED", pickupDetails: { recipient: { phoneNumber: "+15551234567" } } },
            ],
          },
        },
      },
    })
    mockSendSms.mockResolvedValue({})
    const response = await callPost("{}", "sig")
    expect(response.status).toBe(200)
    expect(mockSendSms).toHaveBeenCalledWith(
      "+15551234567",
      "Order #T-42 confirmed! We'll text you when it's ready."
    )
  })

  it("sends IN_PROGRESS SMS", async () => {
    mockVerify.mockReturnValue(true)
    mockParse.mockReturnValue({
      type: "order.updated",
      data: {
        object: {
          order: {
            id: "o2",
            ticketName: "T-43",
            fulfillments: [
              { state: "IN_PROGRESS", pickupDetails: { recipient: { phoneNumber: "+15559876543" } } },
            ],
          },
        },
      },
    })
    mockSendSms.mockResolvedValue({})
    const response = await callPost("{}", "sig")
    expect(response.status).toBe(200)
    expect(mockSendSms).toHaveBeenCalledWith(
      "+15559876543",
      "We're making your order #T-43 now! ETA ~10 min"
    )
  })

  it("sends COMPLETED SMS", async () => {
    mockVerify.mockReturnValue(true)
    mockParse.mockReturnValue({
      type: "order.updated",
      data: {
        object: {
          order: {
            id: "o3",
            ticketName: "T-44",
            fulfillments: [
              { state: "COMPLETED", pickupDetails: { recipient: { phoneNumber: "+15551112222" } } },
            ],
          },
        },
      },
    })
    mockSendSms.mockResolvedValue({})
    const response = await callPost("{}", "sig")
    expect(response.status).toBe(200)
    expect(mockSendSms).toHaveBeenCalledWith(
      "+15551112222",
      "Your order #T-44 is ready for pickup!"
    )
  })

  it("uses order id when ticketName is not present", async () => {
    mockVerify.mockReturnValue(true)
    mockParse.mockReturnValue({
      type: "order.updated",
      data: {
        object: {
          order: {
            id: "o-raw-id",
            fulfillments: [
              { state: "COMPLETED", pickupDetails: { recipient: { phoneNumber: "+15550000000" } } },
            ],
          },
        },
      },
    })
    mockSendSms.mockResolvedValue({})
    const response = await callPost("{}", "sig")
    expect(response.status).toBe(200)
    expect(mockSendSms).toHaveBeenCalledWith(
      "+15550000000",
      "Your order #o-raw-id is ready for pickup!"
    )
  })

  it("uses shipmentDetails phone as fallback", async () => {
    mockVerify.mockReturnValue(true)
    mockParse.mockReturnValue({
      type: "order.updated",
      data: {
        object: {
          order: {
            id: "o4",
            ticketName: "T-45",
            fulfillments: [
              {
                state: "PROPOSED",
                pickupDetails: { recipient: {} },
                shipmentDetails: { recipient: { phoneNumber: "+15559999999" } },
              },
            ],
          },
        },
      },
    })
    mockSendSms.mockResolvedValue({})
    const response = await callPost("{}", "sig")
    expect(response.status).toBe(200)
    expect(mockSendSms).toHaveBeenCalledWith("+15559999999", expect.any(String))
  })

  it("does not send SMS for unknown fulfillment state", async () => {
    mockVerify.mockReturnValue(true)
    mockParse.mockReturnValue({
      type: "order.updated",
      data: {
        object: {
          order: {
            id: "o5",
            fulfillments: [
              { state: "CANCELED", pickupDetails: { recipient: { phoneNumber: "+15551234567" } } },
            ],
          },
        },
      },
    })
    const response = await callPost("{}", "sig")
    expect(response.status).toBe(200)
    expect(mockSendSms).not.toHaveBeenCalled()
  })
})
