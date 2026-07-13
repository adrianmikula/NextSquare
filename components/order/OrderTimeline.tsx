"use client"

import type { OrderState } from "@/types/order"

interface TimelineStep {
  state: OrderState
  label: string
  description: string
}

const steps: TimelineStep[] = [
  {
    state: "PROPOSED",
    label: "Order Placed",
    description: "Your order has been received",
  },
  {
    state: "IN_PROGRESS",
    label: "Preparing",
    description: "We're making your order",
  },
  {
    state: "COMPLETED",
    label: "Ready",
    description: "Your order is ready!",
  },
]

interface OrderTimelineProps {
  currentState: OrderState
}

export function OrderTimeline({ currentState }: OrderTimelineProps) {
  const currentIndex = steps.findIndex((s) => s.state === currentState)

  return (
    <div className="space-y-6">
      {steps.map((step, index) => {
        const isComplete = index <= currentIndex
        const isCurrent = index === currentIndex

        return (
          <div key={step.state} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  isComplete
                    ? "bg-[var(--color-primary)] text-[var(--color-background)]"
                    : "bg-section-alt text-muted"
                } ${isCurrent ? "ring-2 ring-[var(--color-primary)] ring-offset-2" : ""}`}
              >
                {isComplete ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mt-1 h-full w-0.5 ${
                    index < currentIndex ? "bg-[var(--color-primary)]" : "bg-stone-200"
                  }`}
                />
              )}
            </div>
            <div className={`pb-6 ${isCurrent ? "opacity-100" : isComplete ? "opacity-60" : "opacity-40"}`}>
              <p className="font-medium text-heading">{step.label}</p>
              <p className="text-sm text-muted">{step.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
