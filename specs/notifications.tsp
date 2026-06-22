/**
 * Notification domain models — SMS and webhook event handling.
 */

model SmsPayload {
  to: string
  message: string
}

model SmsResponse {
  success: boolean
  error?: string
}

@route("/api/twilio/sms")
namespace SmsApi {
  @post op sendSms(body: SmsPayload): SmsResponse
}

model SquareWebhookEvent {
  type: string
  data: {
    object: {
      order: {
        id: string
        ticketName?: string
        fulfillments?: SquareOrderFulfillment[]
      }
    }
  }
}

model WebhookVerificationResult {
  isValid: boolean
}

@route("/api/square/webhook")
namespace WebhookHandler {
  op verifySignature(body: string, signature: string): boolean
  op parseEvent(body: string): SquareWebhookEvent | null
}
