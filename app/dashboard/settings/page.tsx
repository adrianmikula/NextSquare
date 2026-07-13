import type { Metadata } from "next"
import { Client, Environment } from "square/legacy"
import { CheckCircle2, XCircle } from "lucide-react"
import { requireEnv } from "@/lib/env"

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
}

const { locationsApi } = new Client({
  accessToken: requireEnv("SQUARE_ACCESS_TOKEN"),
  environment:
    requireEnv("SQUARE_ENVIRONMENT") === "production" ? Environment.Production : Environment.Sandbox,
})

async function checkSquareConnection() {
  try {
    const { result } = await locationsApi.retrieveLocation(
      requireEnv("SQUARE_LOCATION_ID")
    )
    return { connected: true, name: result.location?.name ?? "Connected" }
  } catch {
    return { connected: false, name: "" }
  }
}

export default async function SettingsPage() {
  const square = await checkSquareConnection()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-heading">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Dashboard and Square integration settings
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="card bg-base-100 p-6" style={{ boxShadow: "var(--card-shadow, var(--theme-shadow-card))", border: "var(--card-border-toggle, var(--theme-border-width, 1px)) var(--theme-border-style, solid) var(--color-card-border)", transition: "box-shadow var(--transition-speed, 300ms) var(--motion-easing, ease), transform var(--transition-speed, 300ms) var(--motion-easing, ease)" }}>
          <h2 className="text-lg font-semibold text-heading">
            Square Connection
          </h2>
          <div className="mt-4 flex items-center gap-3">
            {square.connected ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-sm text-label">
                  Connected to <strong>{square.name}</strong>
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-error" />
                <span className="text-sm text-label">
                  Not connected. Check your <code className="rounded bg-section-alt px-1 py-0.5 font-mono text-xs">SQUARE_ACCESS_TOKEN</code> and{" "}
                  <code className="rounded bg-section-alt px-1 py-0.5 font-mono text-xs">SQUARE_LOCATION_ID</code>.
                </span>
              </>
            )}
          </div>
        </div>

        <div className="card bg-base-100 p-6" style={{ boxShadow: "var(--card-shadow, var(--theme-shadow-card))", border: "var(--card-border-toggle, var(--theme-border-width, 1px)) var(--theme-border-style, solid) var(--color-card-border)", transition: "box-shadow var(--transition-speed, 300ms) var(--motion-easing, ease), transform var(--transition-speed, 300ms) var(--motion-easing, ease)" }}>
          <h2 className="text-lg font-semibold text-heading">
            Dashboard Access
          </h2>
          <p className="mt-2 text-sm text-muted">
            Single-user password-based authentication.
          </p>
        </div>
      </div>
    </div>
  )
}
