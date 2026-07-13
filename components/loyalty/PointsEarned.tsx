"use client"

interface PointsEarnedProps {
  pointsEarned: number
  totalBalance: number
}

export function PointsEarned({ pointsEarned, totalBalance }: PointsEarnedProps) {
  return (
    <div className="card bg-base-100 border border-card bg-section-alt p-4" style={{ boxShadow: "var(--card-shadow, var(--theme-shadow-card))", border: "var(--card-border-toggle, var(--theme-border-width, 1px)) var(--theme-border-style, solid) var(--color-card-border)", transition: "box-shadow var(--transition-speed, 300ms) var(--motion-easing, ease), transform var(--transition-speed, 300ms) var(--motion-easing, ease)" }}>
      <p className="font-semibold text-price">
        You earned {pointsEarned} points on this order!
      </p>
      <p className="mt-1 text-sm text-price">
        You now have {totalBalance} points.
      </p>
    </div>
  )
}
