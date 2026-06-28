export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
        `  Add it to your .env.local file. See .env.local.example for reference.`
    )
  }
  return value
}

export function requireEnvListOptional(name: string, defaultValue: string[] = []): string[] {
  const value = process.env[name]
  if (!value) return defaultValue
  return value.split(",").map((s) => s.trim()).filter(Boolean)
}

export function requireEnvInt(name: string, defaultValue: number): number {
  const raw = process.env[name]
  if (raw === undefined || raw === "") {
    return defaultValue
  }
  const value = parseInt(raw, 10)
  if (isNaN(value) || value <= 0) {
    throw new Error(
      `Invalid integer value for ${name}: ${raw}\n` +
        `  Expected a positive number. See .env.local.example for reference.`
    )
  }
  return value
}

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true"
}
