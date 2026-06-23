import { NextRequest } from "next/server"
import { createSession } from "@/lib/auth/session"
import { verifyMfaCode, clearMfaCode, getMfaKey, getMfaRole } from "@/lib/auth/mfa"
import { rateLimit, getRateLimitResponse } from "@/lib/security/rate-limit"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown"

  const rateLimitResult = rateLimit(`verify:${ip}`, 10, 15 * 60 * 1000)
  if (!rateLimitResult.allowed) {
    return getRateLimitResponse(rateLimitResult.retryAfter!)
  }

  const { code } = await request.json()

  if (!code || typeof code !== "string") {
    return Response.json({ error: "Invalid code" }, { status: 400 })
  }

  const key = getMfaKey(ip)
  const isValid = verifyMfaCode(key, code, ip)

  if (!isValid) {
    return Response.json({ error: "Invalid code" }, { status: 401 })
  }

  const role = getMfaRole(key) ?? "owner"
  clearMfaCode(key)
  await createSession([role])

  return Response.json({ success: true })
}
