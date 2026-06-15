import "server-only"
import { SignJWT, jwtVerify, type JWTPayload } from "jose"
import { cookies } from "next/headers"

export interface SessionPayload extends JWTPayload {
  userId: string
}

function getEncodedKey() {
  return new TextEncoder().encode(process.env.DASHBOARD_PASSWORD ?? "")
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getEncodedKey())
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify<SessionPayload>(session, getEncodedKey(), {
      algorithms: ["HS256"],
    })
    return payload
  } catch {
    return undefined
  }
}

export async function createSession() {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ userId: "admin" })
  const cookieStore = await cookies()
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

export async function getSession() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get("session")?.value
  if (!cookie) return undefined
  return decrypt(cookie)
}
