import { describe, expect, it, vi, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { SquareFallback } from "@/components/checkout/SquareFallback"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("SquareFallback", () => {
  it("renders nothing when URL is not configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SQUARE_ORDERING_PROFILE_URL", "")
    const { container } = render(<SquareFallback />)
    expect(container.firstChild).toBeNull()
  })

  it("renders fallback link when URL is configured", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SQUARE_ORDERING_PROFILE_URL",
      "https://mycafe.square.site"
    )
    render(<SquareFallback />)
    expect(
      screen.getByText("Having trouble with checkout?")
    ).toBeInTheDocument()
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "https://mycafe.square.site")
    expect(link).toHaveAttribute("target", "_blank")
  })
})
