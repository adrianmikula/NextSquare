import { NextRequest } from "next/server"
import { createSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!password || password !== process.env.DASHBOARD_PASSWORD) {
    return Response.json({ error: "Invalid password" }, { status: 401 })
  }

  await createSession()

  return Response.json({ success: true })
}
