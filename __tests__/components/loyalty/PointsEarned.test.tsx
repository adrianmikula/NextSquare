import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { PointsEarned } from "@/components/loyalty/PointsEarned"

describe("PointsEarned", () => {
  it("displays points earned message", () => {
    render(<PointsEarned pointsEarned={50} totalBalance={200} />)
    expect(screen.getByText("You earned 50 points on this order!")).toBeInTheDocument()
  })

  it("displays total balance", () => {
    render(<PointsEarned pointsEarned={50} totalBalance={200} />)
    expect(screen.getByText("You now have 200 points.")).toBeInTheDocument()
  })

  it("handles zero points", () => {
    render(<PointsEarned pointsEarned={0} totalBalance={100} />)
    expect(screen.getByText("You earned 0 points on this order!")).toBeInTheDocument()
  })

  it("handles large numbers", () => {
    render(<PointsEarned pointsEarned={9999} totalBalance={99999} />)
    expect(screen.getByText("You earned 9999 points on this order!")).toBeInTheDocument()
    expect(screen.getByText("You now have 99999 points.")).toBeInTheDocument()
  })
})
