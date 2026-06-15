"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Invalid password")
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {error && (
        <p className="text-sm font-medium text-red-600">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  )
}
