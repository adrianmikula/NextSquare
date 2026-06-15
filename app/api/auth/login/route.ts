import { NextRequest } from "next/server"
import { createSession } from "@/lib/auth/session"
import { requireEnv } from "@/lib/env"

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!password || password !== requireEnv("DASHBOARD_PASSWORD")) {
    return Response.json({ error: "Invalid password" }, { status: 401 })
  }

  await createSession()

  return Response.json({ success: true })
}
