const mfaStore = new Map<string, { code: string; expiresAt: number; ip: string; role: string; squareRequired: boolean }>()

export function getMfaKey(ip: string): string {
  return `mfa:${ip}`
}

export function storeMfaCode(
  key: string,
  code: string,
  ip: string,
  ttlSeconds: number,
  role: string,
  squareRequired: boolean = false
) {
  mfaStore.set(key, {
    code,
    expiresAt: Date.now() + ttlSeconds * 1000,
    ip,
    role,
    squareRequired,
  })
}

export function verifyMfaCode(key: string, code: string, ip: string): boolean {
  const entry = mfaStore.get(key)
  if (!entry) return false
  if (entry.expiresAt < Date.now()) {
    mfaStore.delete(key)
    return false
  }
  if (entry.ip !== ip) return false
  if (entry.code !== code) return false
  mfaStore.delete(key)
  return true
}

export function getMfaRole(key: string): string | undefined {
  return mfaStore.get(key)?.role
}

export function isMfaSquareRequired(key: string): boolean {
  return mfaStore.get(key)?.squareRequired ?? false
}

export function clearMfaCode(key: string) {
  mfaStore.delete(key)
}
