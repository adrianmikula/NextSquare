import { describe, expect, it, vi, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { OrderButton } from "@/components/order-button"

vi.mock("@/components/ui/button", () => ({
  buttonVariants: () => "mock-button-variants",
}))

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("OrderButton", () => {
  it("renders null when NEXT_PUBLIC_SQUARE_ORDERING_PROFILE_URL is not set", () => {
    vi.stubEnv("NEXT_PUBLIC_SQUARE_ORDERING_PROFILE_URL", "")
    const { container } = render(<OrderButton />)
    expect(container.firstChild).toBeNull()
  })

  it("renders an anchor linking to the Square ordering URL", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SQUARE_ORDERING_PROFILE_URL",
      "https://square.example.com/order"
    )
    render(<OrderButton />)
    const link = screen.getByRole("link", { name: /order now/i })
    expect(link).toHaveAttribute(
      "href",
      "https://square.example.com/order"
    )
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
  })
})
