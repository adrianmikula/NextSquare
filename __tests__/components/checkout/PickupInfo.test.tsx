import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PickupInfo } from "@/components/checkout/PickupInfo"

describe("PickupInfo", () => {
  it("renders name and phone inputs", () => {
    render(
      <PickupInfo
        name=""
        phone=""
        onNameChange={vi.fn()}
        onPhoneChange={vi.fn()}
      />
    )
    expect(screen.getByLabelText("Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Phone")).toBeInTheDocument()
  })

  it("displays the current name and phone values", () => {
    render(
      <PickupInfo
        name="Alice"
        phone="0412345678"
        onNameChange={vi.fn()}
        onPhoneChange={vi.fn()}
      />
    )
    expect(screen.getByLabelText("Name")).toHaveValue("Alice")
    expect(screen.getByLabelText("Phone")).toHaveValue("0412345678")
  })

  it("calls onNameChange when name input changes", async () => {
    const onNameChange = vi.fn()
    const user = userEvent.setup()
    render(
      <PickupInfo
        name=""
        phone=""
        onNameChange={onNameChange}
        onPhoneChange={vi.fn()}
      />
    )
    await user.type(screen.getByLabelText("Name"), "Bob")
    expect(onNameChange).toHaveBeenCalled()
  })
})
