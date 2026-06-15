"use client"

import { useState, useRef, useEffect } from "react"

interface SquarePaymentFormProps {
  amount: number
  currency?: string
  onError: (error: string) => void
  onSubmit: (nonce: string) => Promise<void>
}

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => {
        card: () => Promise<{
          tokenize: () => Promise<{
            status: string
            token?: string
            errors?: Array<{ code: string; detail: string }>
          }>
          attach: (elementId: string) => Promise<void>
          destroy: () => Promise<void>
        }>
      }
    }
  }
}

export function SquarePaymentForm({
  amount,
  currency = "AUD",
  onError,
  onSubmit,
}: SquarePaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [cardLoaded, setCardLoaded] = useState(false)
  const cardInstanceRef = useRef<{
    tokenize: () => Promise<{
      status: string
      token?: string
      errors?: Array<{ code: string; detail: string }>
    }>
    destroy: () => Promise<void>
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initCard = async () => {
      const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID
      const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID

      if (!appId || !locationId || !containerRef.current) {
        onError("Square is not configured")
        return
      }

      try {
        if (!window.Square) {
          const script = document.createElement("script")
          script.src = "https://web.squarecdn.com/v1/square.js"
          script.async = true
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve()
            script.onerror = () => reject(new Error("Failed to load Square SDK"))
            document.head.appendChild(script)
          })
        }

        if (!window.Square) {
          onError("Square SDK failed to load")
          return
        }

        const payments = window.Square.payments(appId, locationId)
        const card = await payments.card()
        await card.attach("#square-card-container")
        cardInstanceRef.current = card
        setCardLoaded(true)
      } catch (err) {
        onError(err instanceof Error ? err.message : "Failed to initialize card form")
      }
    }

    initCard()

    return () => {
      cardInstanceRef.current?.destroy()
    }
  }, [onError])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const card = cardInstanceRef.current
      if (!card) {
        onError("Payment form not initialized")
        setLoading(false)
        return
      }

      const result = await card.tokenize()
      if (result.status === "OK" && result.token) {
        await onSubmit(result.token)
      } else {
        onError(result.errors?.[0]?.detail ?? "Payment tokenization failed")
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "Payment failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-stone-900">Payment</h3>
      <div
        id="square-card-container"
        ref={containerRef}
        className="min-h-[100px]"
      />
      <button
        onClick={handleSubmit}
        disabled={loading || !cardLoaded}
        className="mt-4 w-full rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Processing..." : `Pay ${new Intl.NumberFormat("en-AU", {
          style: "currency",
          currency,
        }).format(amount / 100)}`}
      </button>
    </div>
  )
}
