import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("@/components/google-maps", () => ({
  GoogleMaps: () => <div data-testid="google-maps">Map</div>,
}))

import ContactPage from "@/app/contact/page"

describe("ContactPage", () => {
  it("renders the page heading", () => {
    render(<ContactPage />)
    expect(screen.getByText("Contact Us")).toBeInTheDocument()
  })

  it("renders the hours section", () => {
    render(<ContactPage />)
    expect(screen.getByText("Hours")).toBeInTheDocument()
    expect(screen.getByText("Monday")).toBeInTheDocument()
  })

  it("renders the contact form", () => {
    render(<ContactPage />)
    expect(screen.getByText("Name")).toBeInTheDocument()
    expect(screen.getByText("Email")).toBeInTheDocument()
    expect(screen.getByText("Message")).toBeInTheDocument()
  })

  it("renders the submit button", () => {
    render(<ContactPage />)
    expect(screen.getByText("Submit")).toBeInTheDocument()
  })

  it("renders social icons", () => {
    render(<ContactPage />)
    expect(screen.getByText("🛵")).toBeInTheDocument()
  })

  it("renders CTA section", () => {
    render(<ContactPage />)
    expect(screen.getByText("Visit Aydin's Cafe")).toBeInTheDocument()
  })
})
