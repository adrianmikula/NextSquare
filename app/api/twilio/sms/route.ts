import { NextRequest } from "next/server"
import { sendSms } from "@/lib/twilio/client"

export async function POST(request: NextRequest) {
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
    console.error("SMS sending error:", error)
    return Response.json(
      { error: "Failed to send SMS" },
      { status: 500 }
    )
  }
}
