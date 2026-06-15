import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { StatCard } from "@/components/dashboard/stat-card"

describe("StatCard", () => {
  it("renders title and value", () => {
    render(<StatCard title="Revenue" value="$1,234" />)
    expect(screen.getByText("Revenue")).toBeDefined()
    expect(screen.getByText("$1,234")).toBeDefined()
  })

  it("renders numeric values", () => {
    render(<StatCard title="Orders" value={42} />)
    expect(screen.getByText("42")).toBeDefined()
  })
})
