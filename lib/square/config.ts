import { isDemoMode } from "@/lib/demo/config"

export const API_VERSION = "2025-01-23"

export function getSquareApiBase(): string {
  if (isDemoMode()) return "https://connect.squareupsandbox.com"
  return process.env.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com"
}

export function getSquareHeaders(): Record<string, string> {
  return {
    "Square-Version": API_VERSION,
    Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN ?? ""}`,
    "Content-Type": "application/json",
  }
}

export function getSquareEnvironment(): "sandbox" | "production" {
  if (isDemoMode()) return "sandbox"
  return (process.env.SQUARE_ENVIRONMENT as "sandbox" | "production") ?? "sandbox"
}
