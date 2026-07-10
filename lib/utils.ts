import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "AUD"): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
  }).format(amount / 100)
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 10) {
    return `+61${cleaned.slice(1)}`
  }
  if (cleaned.startsWith("61") && cleaned.length === 11) {
    return `+${cleaned}`
  }
  return phone
}

export function safeSearchParams(
  sp: Record<string, string | string[] | undefined | null> | null | undefined
): URLSearchParams {
  if (!sp) return new URLSearchParams()
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(sp)) {
    if (value != null) {
      params.set(key, Array.isArray(value) ? value[0] : value)
    }
  }
  return params
}

export function toPrice(
  money: { amount: bigint; currency: string } | undefined,
  fallbackCurrency = "AUD"
): { amount: number; currency: string } {
  return {
    amount: Number(money?.amount ?? 0),
    currency: money?.currency ?? fallbackCurrency,
  }
}
