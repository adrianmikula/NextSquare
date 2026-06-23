import { NextRequest } from "next/server"
import { createSession } from "@/lib/auth/session"
import { requireEnv, requireEnvListOptional } from "@/lib/env"
import { rateLimit, getRateLimitResponse } from "@/lib/security/rate-limit"
import { Client, Environment } from "square/legacy"

export async function POST(request: NextRequest) {
  const ip =
    request.headers?.get?.("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"

  const rateLimitResult = rateLimit(`api:${ip}`, 30, 60 * 1000)
  if (!rateLimitResult.allowed) {
    return getRateLimitResponse(rateLimitResult.retryAfter!)
  }
  const { password } = await request.json()

  if (!password || password !== requireEnv("DASHBOARD_PASSWORD")) {
    return Response.json({ error: "Invalid password" }, { status: 401 })
  }

  const adminEmail = process.env.DASHBOARD_ADMIN_EMAIL?.toLowerCase().trim()
  const developerEmails = requireEnvListOptional("DASHBOARD_DEVELOPER_EMAILS")

  let role: string

  if (adminEmail && developerEmails.includes(adminEmail)) {
    role = "developer"
  } else if (adminEmail) {
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
      console.error("[rbac] Square team lookup failed:", error)
      return Response.json(
        { error: "Authentication service temporarily unavailable. Please try again later." },
        { status: 503 }
      )
    }
  } else {
    role = "owner"
  }

  await createSession([role])

  return Response.json({ success: true })
}
