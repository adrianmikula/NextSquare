import { isDemoMode } from "@/lib/demo/config"
import { requireEnv } from "@/lib/env"

export const API_VERSION = "2025-01-23"

export function getSquareApiBase(): string {
  if (isDemoMode()) return "https://connect.squareupsandbox.com"
  return requireEnv("SQUARE_ENVIRONMENT") === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com"
}

export function getSquareHeaders(): Record<string, string> {
  return {
    "Square-Version": API_VERSION,
    Authorization: `Bearer ${isDemoMode() ? "" : requireEnv("SQUARE_ACCESS_TOKEN")}`,
    "Content-Type": "application/json",
  }
}

export function getSquareEnvironment(): "sandbox" | "production" {
  if (isDemoMode()) return "sandbox"
  return requireEnv("SQUARE_ENVIRONMENT") as "sandbox" | "production"
}
