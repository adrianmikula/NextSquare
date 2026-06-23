"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"

type Step = "password" | "otp"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>("password")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const resetTimer = useCallback((ttlSeconds: number) => {
    setCountdown(ttlSeconds)
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Invalid password")
        return
      }

      setStep("otp")
      resetTimer(300)
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Invalid code")
        return
      }

      const redirect = searchParams.get("redirect") ?? "/dashboard"
      router.push(redirect)
      router.refresh()
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function handleBack() {
    setStep("password")
    setCode("")
    setError("")
    setCountdown(0)
  }

  return (
    <form onSubmit={step === "password" ? handlePasswordSubmit : handleOtpSubmit} className="space-y-4">
      {step === "password" && (
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-stone-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter dashboard password"
            required
            autoFocus
            className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
        </div>
      )}

      {step === "otp" && (
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-stone-700"
          >
            Verification Code
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter 6-digit code"
            required
            autoFocus
            className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
          {countdown > 0 && (
            <p className="mt-1 text-xs text-stone-500">
              Code expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
            </p>
          )}
          {countdown === 0 && (
            <p className="mt-1 text-xs text-red-600">Code expired. Re-enter password.</p>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm font-medium text-red-600">{error}</p>
      )}

      <div className="flex gap-2">
        {step === "otp" && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleBack}
            disabled={loading}
          >
            Back
          </Button>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verifying..." : step === "password" ? "Send Code" : "Verify"}
        </Button>
      </div>
    </form>
  )
}
