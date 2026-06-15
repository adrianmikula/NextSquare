import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PriceInput } from "@/components/dashboard/price-input"

describe("PriceInput", () => {
  it("renders with initial value", () => {
    render(<PriceInput value={5.5} onChange={() => {}} />)
    const input = screen.getByRole("spinbutton")
    expect(input).toHaveValue(5.5)
  })

  it("calls onChange when value changes", async () => {
    const onChange = vi.fn()
    render(<PriceInput value={0} onChange={onChange} />)
    const input = screen.getByRole("spinbutton")
    await userEvent.clear(input)
    await userEvent.type(input, "10")
    expect(onChange).toHaveBeenCalled()
  })
})
