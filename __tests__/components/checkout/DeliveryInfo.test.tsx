import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DeliveryInfo } from "@/components/checkout/DeliveryInfo"

describe("DeliveryInfo", () => {
  const defaultProps = {
    name: "",
    phone: "",
    address: {
      addressLine1: "",
      addressLine2: "",
      locality: "",
      administrativeDistrictLevel1: "",
      postalCode: "",
    },
    deliveryNotes: "",
    onNameChange: vi.fn(),
    onPhoneChange: vi.fn(),
    onAddressChange: vi.fn(),
    onNotesChange: vi.fn(),
  }

  it("renders all delivery form fields", () => {
    render(<DeliveryInfo {...defaultProps} />)
    expect(screen.getByLabelText("Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Phone")).toBeInTheDocument()
    expect(screen.getByLabelText("Street Address")).toBeInTheDocument()
    expect(screen.getByLabelText("Suburb")).toBeInTheDocument()
    expect(screen.getByLabelText("State")).toBeInTheDocument()
    expect(screen.getByLabelText("Postcode")).toBeInTheDocument()
    expect(screen.getByLabelText("Delivery Notes")).toBeInTheDocument()
  })

  it("shows Australian state options", () => {
    render(<DeliveryInfo {...defaultProps} />)
    const select = screen.getByLabelText("State")
    expect(select).toBeInTheDocument()
    const options = Array.from(select.querySelectorAll("option"))
    const stateOptions = options.filter((o) => o.value)
    expect(stateOptions).toHaveLength(8)
  })

  it("calls onAddressChange when address field changes", async () => {
    const onAddressChange = vi.fn()
    const user = userEvent.setup()
    render(
      <DeliveryInfo
        {...defaultProps}
        onAddressChange={onAddressChange}
      />
    )
    await user.type(screen.getByLabelText("Street Address"), "123 Main St")
    expect(onAddressChange).toHaveBeenCalled()
  })
})
