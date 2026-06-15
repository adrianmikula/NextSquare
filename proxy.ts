import { NextRequest, NextResponse } from "next/server"
import { decrypt } from "@/lib/auth/session"

const protectedRoutes = ["/dashboard"]
const publicRoutes = ["/login"]

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  )
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route))

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

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
}
