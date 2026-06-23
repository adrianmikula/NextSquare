import { NextRequest } from "next/server"
import { createSession } from "@/lib/auth/session"
import { requireEnv } from "@/lib/env"
import { rateLimit, getRateLimitResponse } from "@/lib/security/rate-limit"

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

  await createSession()

  return Response.json({ success: true })
}
