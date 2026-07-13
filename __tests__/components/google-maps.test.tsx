import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { GoogleMaps } from "@/components/google-maps"

describe("GoogleMaps", () => {
  function renderGoogleMaps() {
    return render(<GoogleMaps />)
  }

  it("renders an iframe with map embed", () => {
    renderGoogleMaps()
    const iframe = screen.getByTitle("Cafe Location")
    expect(iframe).toBeInTheDocument()
    expect(iframe.tagName).toBe("IFRAME")
  })

  it("loads with lazy loading", () => {
    renderGoogleMaps()
    const iframe = screen.getByTitle("Cafe Location")
    expect(iframe).toHaveAttribute("loading", "lazy")
  })

  it("has correct Google Maps embed URL", () => {
    renderGoogleMaps()
    const iframe = screen.getByTitle("Cafe Location") as HTMLIFrameElement
    expect(iframe.src).toContain("google.com/maps/embed")
  })
})
