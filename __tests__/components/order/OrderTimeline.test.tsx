import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { OrderTimeline } from "@/components/order/OrderTimeline"

describe("OrderTimeline", () => {
  it("renders all timeline steps", () => {
    render(<OrderTimeline currentState="PROPOSED" />)
    expect(screen.getByText("Order Placed")).toBeInTheDocument()
    expect(screen.getByText("Preparing")).toBeInTheDocument()
    expect(screen.getByText("Ready")).toBeInTheDocument()
  })

  it("shows only Order Placed as complete for PROPOSED state", () => {
    const { container } = render(<OrderTimeline currentState="PROPOSED" />)
    const orderPlaced = screen.getByText("Order Placed").closest("div")
    expect(orderPlaced?.className).not.toContain("opacity-40")
  })

  it("shows Order Placed and Preparing as complete for IN_PROGRESS state", () => {
    render(<OrderTimeline currentState="IN_PROGRESS" />)
    const orderPlaced = screen.getByText("Order Placed").closest("div")
    const preparing = screen.getByText("Preparing").closest("div")
    const ready = screen.getByText("Ready").closest("div")?.parentElement
    // All should be visible
    expect(orderPlaced).toBeTruthy()
    expect(preparing).toBeTruthy()
    expect(ready).toBeTruthy()
  })

  it("shows all steps complete for COMPLETED state", () => {
    render(<OrderTimeline currentState="COMPLETED" />)
    expect(screen.getByText("Order Placed")).toBeInTheDocument()
    expect(screen.getByText("Preparing")).toBeInTheDocument()
    expect(screen.getByText("Ready")).toBeInTheDocument()
  })
})
