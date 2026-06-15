export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

export function isDemoMode(): boolean {
  return DEMO_MODE
}

export function requireDemoMode(): void {
  if (!DEMO_MODE) {
    throw new Error("This operation is only available in demo mode")
  }
}
