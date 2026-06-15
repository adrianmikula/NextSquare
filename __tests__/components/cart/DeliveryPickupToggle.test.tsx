import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DeliveryPickupToggle } from "@/components/cart/DeliveryPickupToggle"

describe("DeliveryPickupToggle", () => {
  it("renders both pickup and delivery options", () => {
    render(<DeliveryPickupToggle value="PICKUP" onChange={vi.fn()} />)
    expect(screen.getByText("Pickup")).toBeInTheDocument()
    expect(screen.getByText("Delivery")).toBeInTheDocument()
  })

  it("highlights the active option", () => {
    const { rerender } = render(
      <DeliveryPickupToggle value="PICKUP" onChange={vi.fn()} />
    )
    const pickupBtn = screen.getByText("Pickup")
    const deliveryBtn = screen.getByText("Delivery")

    expect(pickupBtn.className).toContain("bg-white")
    expect(deliveryBtn.className).not.toContain("bg-white")

    rerender(<DeliveryPickupToggle value="DELIVERY" onChange={vi.fn()} />)
    expect(deliveryBtn.className).toContain("bg-white")
    expect(pickupBtn.className).not.toContain("bg-white")
  })

  it("calls onChange with DELIVERY when delivery button clicked", async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<DeliveryPickupToggle value="PICKUP" onChange={onChange} />)
    await user.click(screen.getByText("Delivery"))
    expect(onChange).toHaveBeenCalledWith("DELIVERY")
  })

  it("calls onChange with PICKUP when pickup button clicked", async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<DeliveryPickupToggle value="DELIVERY" onChange={onChange} />)
    await user.click(screen.getByText("Pickup"))
    expect(onChange).toHaveBeenCalledWith("PICKUP")
  })
})
