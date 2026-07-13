import { describe, expect, it, vi, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { DemoBadge } from "@/components/demo/DemoBadge"

vi.mock("@/lib/demo/config", () => ({
  isDemoMode: vi.fn(),
}))

import { isDemoMode } from "@/lib/demo/config"

afterEach(() => {
  vi.clearAllMocks()
})

describe("DemoBadge", () => {
  function renderBadge() {
    return render(<DemoBadge />)
  }

  it("renders nothing when not in demo mode", () => {
    vi.mocked(isDemoMode).mockReturnValue(false)
    const { container } = renderBadge()
    expect(container.textContent).toBe("")
  })

  it("renders demo badge when in demo mode", () => {
    vi.mocked(isDemoMode).mockReturnValue(true)
    renderBadge()
    expect(screen.getByText("Demo Mode")).toBeInTheDocument()
  })
})
