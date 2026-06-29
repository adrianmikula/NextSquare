import { NextRequest } from "next/server"
import { sendSms } from "@/lib/twilio/client"
import { rateLimit, getRateLimitResponse } from "@/lib/security/rate-limit"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  const ip =
    request.headers?.get?.("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"

  const rateLimitResult = rateLimit(`twilio:${ip}`, 5, 60 * 1000)
  if (!rateLimitResult.allowed) {
    return getRateLimitResponse(rateLimitResult.retryAfter!)
  }
  try {
    const { to, message } = await request.json()

    if (!to || !message) {
      return Response.json(
        { error: "Missing required fields: to, message" },
        { status: 400 }
      )
    }

    await sendSms(to, message)
    return Response.json({ success: true })
  } catch (error) {
    logger("sms").error("SMS sending error", error instanceof Error ? error : new Error(String(error)))
    return Response.json(
      { error: "Failed to send SMS" },
      { status: 500 }
    )
  }
}
