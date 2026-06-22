/**
 * Authentication and session management models.
 */

model Session {
  userId: string
  expires: string
}

model LoginPayload {
  password: string
}

model LoginResponse {
  success: boolean
  error?: string
}

@route("/api/auth/login")
namespace LoginApi {
  @post op login(body: LoginPayload): LoginResponse
}

@route("/api/auth/logout")
namespace LogoutApi {
  @post op logout(): { success: boolean }
}

model AuthMiddlewareConfig {
  matcher: string[]
  protectedRoutes: string[]
  publicRoutes: string[]
}
