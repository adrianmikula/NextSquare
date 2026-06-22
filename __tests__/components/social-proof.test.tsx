import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

describe("SocialProof", () => {
  async function renderSocialProof() {
    const { SocialProof } = await import("@/components/social-proof")
    return render(<SocialProof />)
  }

  it("renders section heading", async () => {
    await renderSocialProof()
    expect(screen.getByText("What Our Customers Say")).toBeInTheDocument()
  })

  it("renders all three reviews", async () => {
    await renderSocialProof()
    expect(screen.getByText(/Best flat white/)).toBeInTheDocument()
    expect(screen.getByText(/Love the avocado toast/)).toBeInTheDocument()
    expect(screen.getByText(/Fast online ordering/)).toBeInTheDocument()
  })

  it("renders author names", async () => {
    await renderSocialProof()
    expect(screen.getByText(/Sarah M./)).toBeInTheDocument()
    expect(screen.getByText(/James K./)).toBeInTheDocument()
    expect(screen.getByText(/Emma L./)).toBeInTheDocument()
  })
})
