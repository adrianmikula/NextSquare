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
        <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
        <p className="mt-1 text-sm text-stone-500">
          Dashboard and Square integration settings
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">
            Square Connection
          </h2>
          <div className="mt-4 flex items-center gap-3">
            {square.connected ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm text-stone-700">
                  Connected to <strong>{square.name}</strong>
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-stone-700">
                  Not connected. Check your <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-xs">SQUARE_ACCESS_TOKEN</code> and{" "}
                  <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-xs">SQUARE_LOCATION_ID</code>.
                </span>
              </>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">
            Dashboard Access
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Single-user password-based authentication.
          </p>
        </div>
      </div>
    </div>
  )
}
