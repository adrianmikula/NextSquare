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
