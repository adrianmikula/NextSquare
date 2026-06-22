import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

describe("GoogleMaps", () => {
  async function renderGoogleMaps() {
    const { GoogleMaps } = await import("@/components/google-maps")
    return render(<GoogleMaps />)
  }

  it("renders an iframe with map embed", async () => {
    await renderGoogleMaps()
    const iframe = screen.getByTitle("Cafe Location")
    expect(iframe).toBeInTheDocument()
    expect(iframe.tagName).toBe("IFRAME")
  })

  it("loads with lazy loading", async () => {
    await renderGoogleMaps()
    const iframe = screen.getByTitle("Cafe Location")
    expect(iframe).toHaveAttribute("loading", "lazy")
  })

  it("has correct Google Maps embed URL", async () => {
    await renderGoogleMaps()
    const iframe = screen.getByTitle("Cafe Location") as HTMLIFrameElement
    expect(iframe.src).toContain("google.com/maps/embed")
  })
})
