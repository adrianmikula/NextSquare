"use client"

interface PointsEarnedProps {
  pointsEarned: number
  totalBalance: number
}

export function PointsEarned({ pointsEarned, totalBalance }: PointsEarnedProps) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="font-semibold text-amber-900">
        You earned {pointsEarned} points on this order!
      </p>
      <p className="mt-1 text-sm text-amber-700">
        You now have {totalBalance} points.
      </p>
    </div>
  )
}
