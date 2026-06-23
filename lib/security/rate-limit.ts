import { NextRequest } from "next/server"

const stores = new Map<string, number[]>()

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  )
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now()
  const entries = stores.get(key) ?? []
  const recent = entries.filter((time) => now - time < windowMs)

  if (recent.length >= limit) {
    const oldest = recent[0]
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000)
    return { allowed: false, remaining: 0, retryAfter }
  }

  recent.push(now)
  stores.set(key, recent)
  return { allowed: true, remaining: limit - recent.length }
}

export function getRateLimitResponse(retryAfter: number): Response {
  return new Response("Too Many Requests", {
    status: 429,
    headers: {
      "Retry-After": retryAfter.toString(),
    },
  })
}
