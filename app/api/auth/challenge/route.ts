import { NextRequest } from "next/server"
import { requireEnv } from "@/lib/env"
import { requireEnvInt } from "@/lib/env"
import { storeMfaCode, getMfaKey } from "@/lib/auth/mfa"
import { sendSms } from "@/lib/twilio/client"
import { rateLimit, getRateLimitResponse } from "@/lib/security/rate-limit"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown"

  const rateLimitResult = rateLimit(`challenge:${ip}`, 5, 15 * 60 * 1000)
  if (!rateLimitResult.allowed) {
    return getRateLimitResponse(rateLimitResult.retryAfter!)
  }

  const { password } = await request.json()

  if (!password || password !== requireEnv("DASHBOARD_PASSWORD")) {
    return Response.json({ error: "Invalid password" }, { status: 401 })
  }

  const bytes = new Uint32Array(1)
  crypto.getRandomValues(bytes)
  const code = (bytes[0] % 1000000).toString().padStart(6, "0")
  const ttl = requireEnvInt("MFA_CODE_TTL", 300)
  const key = getMfaKey(ip)

  storeMfaCode(key, code, ip, ttl)

  try {
    await sendSms(
      requireEnv("DASHBOARD_ADMIN_PHONE"),
      `Your admin verification code is: ${code}`
    )
  } catch (error) {
    console.error("[mfa] Failed to send SMS:", error)
    return Response.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 }
    )
  }

  return Response.json({ challenge: true })
}
