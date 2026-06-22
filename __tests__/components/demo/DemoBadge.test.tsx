import { describe, expect, it, vi, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("@/lib/demo/config", () => ({
  isDemoMode: vi.fn(),
}))

import { isDemoMode } from "@/lib/demo/config"

afterEach(() => {
  vi.clearAllMocks()
})

describe("DemoBadge", () => {
  async function renderBadge() {
    const { DemoBadge } = await import("@/components/demo/DemoBadge")
    return render(<DemoBadge />)
  }

  it("renders nothing when not in demo mode", async () => {
    vi.mocked(isDemoMode).mockReturnValue(false)
    const { container } = await renderBadge()
    expect(container.textContent).toBe("")
  })

  it("renders demo badge when in demo mode", async () => {
    vi.mocked(isDemoMode).mockReturnValue(true)
    await renderBadge()
    expect(screen.getByText("Demo Mode")).toBeInTheDocument()
  })
})
