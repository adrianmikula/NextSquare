import { isDemoMode } from "@/lib/demo/config"
import { requireEnv } from "@/lib/env"

export const API_VERSION = "2025-01-23"

export function getSquareApiBase(): string {
  if (isDemoMode()) return "https://connect.squareupsandbox.com"
  return getSquareEnvironment() === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com"
}

export function getSquareHeaders(): Record<string, string> {
  const token = isDemoMode()
    ? ""
    : requireEnv("SQUARE_ACCESS_TOKEN")
  return {
    "Square-Version": API_VERSION,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

export function getSquareEnvironment(): "sandbox" | "production" {
  if (isDemoMode()) return "sandbox"
  const env = process.env.SQUARE_ENVIRONMENT
  if (!env) {
    if (process.env.NODE_ENV === "development") return "sandbox"
    return requireEnv("SQUARE_ENVIRONMENT") as "sandbox" | "production"
  }
  return env as "sandbox" | "production"
}

export function getSquareDefaultCurrency(): string {
  return process.env.SQUARE_DEFAULT_CURRENCY ?? "AUD"
}

export function getSquareFeeRate(): number {
  const raw = process.env.SQUARE_PLATFORM_FEE_RATE
  if (!raw) return 0.05
  const value = parseFloat(raw)
  if (isNaN(value) || value < 0) return 0.05
  return value
}

export function getSquareEnvironmentForRole(roles: string[]): "sandbox" | "production" {
  if (roles.includes("developer")) return "sandbox"
  return getSquareEnvironment()
}

export function getSquareTokenForRole(roles: string[]): string {
  if (roles.includes("developer")) {
    return process.env.SQUARE_SANDBOX_ACCESS_TOKEN ?? requireEnv("SQUARE_ACCESS_TOKEN")
  }
  if (isDemoMode()) return ""
  return requireEnv("SQUARE_ACCESS_TOKEN")
}

export function getSquareHeadersForRole(roles: string[]): Record<string, string> {
  return {
    "Square-Version": API_VERSION,
    Authorization: `Bearer ${getSquareTokenForRole(roles)}`,
    "Content-Type": "application/json",
  }
}

export function getSquareApiBaseForRole(roles: string[]): string {
  const env = getSquareEnvironmentForRole(roles)
  return env === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com"
}
