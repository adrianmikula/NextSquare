import { Twilio } from "twilio"
import { requireEnv } from "@/lib/env"

function getTwilioClient() {
  return new Twilio(requireEnv("TWILIO_ACCOUNT_SID"), requireEnv("TWILIO_AUTH_TOKEN"))
}

export async function sendSms(to: string, body: string) {
  const client = getTwilioClient()
  return client.messages.create({
    body,
    from: requireEnv("TWILIO_PHONE_NUMBER"),
    to,
  })
}
