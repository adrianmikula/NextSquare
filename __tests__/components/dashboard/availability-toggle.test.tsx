import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AvailabilityToggle } from "@/components/dashboard/availability-toggle"

describe("AvailabilityToggle", () => {
  it("renders available state", () => {
    render(<AvailabilityToggle available={true} onChange={() => {}} />)
    expect(screen.getByText("Available online")).toBeDefined()
  })

  it("renders unavailable state", () => {
    render(<AvailabilityToggle available={false} onChange={() => {}} />)
    expect(screen.getByText("Unavailable")).toBeDefined()
  })

  it("calls onChange when toggled", async () => {
    const onChange = vi.fn()
    render(<AvailabilityToggle available={true} onChange={onChange} />)
    await userEvent.click(screen.getByRole("checkbox"))
    expect(onChange).toHaveBeenCalledWith(false)
  })
})
