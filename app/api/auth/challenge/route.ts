import { NextRequest } from "next/server"
import { requireEnv, requireEnvListOptional } from "@/lib/env"
import { requireEnvInt } from "@/lib/env"
import { storeMfaCode, getMfaKey } from "@/lib/auth/mfa"
import { sendSms } from "@/lib/twilio/client"
import { rateLimit, getRateLimitResponse } from "@/lib/security/rate-limit"
import { logger } from "@/lib/logger"
import { Client, Environment } from "square/legacy"

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

  const adminEmail = process.env.DASHBOARD_ADMIN_EMAIL?.toLowerCase().trim()
  const developerEmails = requireEnvListOptional("DASHBOARD_DEVELOPER_EMAILS")

  let role: string
  let squareRequired = false

  if (adminEmail && developerEmails.includes(adminEmail)) {
    role = "developer"
  } else if (adminEmail) {
    squareRequired = true
    try {
      const { teamApi } = new Client({
        accessToken: requireEnv("SQUARE_ACCESS_TOKEN"),
        environment:
          requireEnv("SQUARE_ENVIRONMENT") === "production"
            ? Environment.Production
            : Environment.Sandbox,
      })

      const { result } = await teamApi.searchTeamMembers({
        query: {
          filter: { status: "ACTIVE" },
        },
      })

      const members = result.teamMembers ?? []
      const member = members.find(
        (m) => m.emailAddress?.toLowerCase() === adminEmail
      )

      if (member) {
        role = member.isOwner ? "owner" : "staff"
      } else {
        role = "visitor"
      }
    } catch (error) {
      logger("rbac").error("Square team lookup failed", error)
      return Response.json(
        { error: "Authentication service temporarily unavailable. Please try again later." },
        { status: 503 }
      )
    }
  } else {
    role = "owner"
  }

  storeMfaCode(key, code, ip, ttl, role, squareRequired)

  try {
    await sendSms(
      requireEnv("DASHBOARD_ADMIN_PHONE"),
      `Your admin verification code is: ${code}`
    )
  } catch (error) {
    logger("mfa").error("Failed to send SMS", error)
    return Response.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 }
    )
  }

  return Response.json({ challenge: true })
}
