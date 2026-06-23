const mfaStore = new Map<string, { code: string; expiresAt: number; ip: string }>()

export function getMfaKey(ip: string): string {
  return `mfa:${ip}`
}

export function storeMfaCode(
  key: string,
  code: string,
  ip: string,
  ttlSeconds: number
) {
  mfaStore.set(key, {
    code,
    expiresAt: Date.now() + ttlSeconds * 1000,
    ip,
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

export function clearMfaCode(key: string) {
  mfaStore.delete(key)
}
