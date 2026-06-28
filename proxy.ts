import { NextRequest, NextResponse } from "next/server"
import { decrypt } from "@/lib/auth/session"
import { isDemoMode } from "@/lib/env"

// ---------------------------------------------------------------------------
// CSP & Demo Mode
// ---------------------------------------------------------------------------
// When `style-src` contains both a `nonce-xxx` and `'unsafe-inline'`, the CSP
// specification says the nonce takes precedence — `'unsafe-inline'` is IGNORED.
// This silently blocks ALL inline styles including those React 18 generates
// during hydration, producing blank or unstyled pages with no console errors.
//
// Demo mode (`DEMO_MODE=true` or `NEXT_PUBLIC_DEMO_MODE=true`) skips CSP
// entirely so content generation and stakeholder demos are never blocked.
// Full headers are restored only when both flags are absent in production.
// See: docs/patterns/csp-demo-mode.md
// ---------------------------------------------------------------------------

const protectedRoutes = ["/dashboard"]
const publicRoutes = ["/login"]

function generateNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

function getSecurityHeaders(nonce: string): Record<string, string> {
  return {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Content-Security-Policy": [
      "script-src 'nonce-" + nonce + "' 'self' https: http:;",
      "style-src 'nonce-" + nonce + "' 'self' https: http:;",
      "img-src 'self' https: data: blob:;",
      "font-src 'self' https: data:;",
      "connect-src 'self' https: wss:;",
      "frame-ancestors 'none';",
      "base-uri 'self';",
      "form-action 'self';",
      "upgrade-insecure-requests",
    ].join(" "),
  }
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  )
  const isPublicRoute = publicRoutes.some((route) =>
    path.startsWith(route)
  )

  const cookie = req.cookies.get("session")?.value
  const session = await decrypt(cookie)

  if (isProtectedRoute && !session?.userId) {
    const loginUrl = new URL("/login", req.nextUrl)
    loginUrl.searchParams.set("redirect", path)
    return NextResponse.redirect(loginUrl)
  }

  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  const nonce = generateNonce()
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-nonce", nonce)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const headers = isDemoMode() ? getDemoModeHeaders() : getSecurityHeaders(nonce)
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value)
  }

  if (!isDemoMode()) {
    response.cookies.set("nonce", nonce, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    })
  }

  return response
}

function getDemoModeHeaders(): Record<string, string> {
  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
}
