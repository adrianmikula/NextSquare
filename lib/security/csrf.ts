import { cookies } from "next/headers"
import crypto from "crypto"

export function createCsrfToken(): string {
  return crypto.randomUUID()
}

export async function setCsrfCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("csrf-token", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  })
}

export async function validateCsrfToken(request: Request): Promise<boolean> {
  const token = request.headers?.get?.("x-csrf-token") ?? null
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get("csrf-token")?.value
  return token !== null && token === cookieToken
}
