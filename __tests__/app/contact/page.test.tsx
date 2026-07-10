import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("@/lib/cms", () => ({
  readCmsPages: () => [
    {
      slug: "contact",
      label: "Contact Us",
      blocks: [
        { type: "text", data: { heading: "Contact Us", body: "Get in touch!" } },
        { type: "hours", data: { schedule: [{ day: "Monday", open: "7:00", close: "15:00" }] } },
        {
          type: "form",
          data: {
            title: "Send us a message",
            fields: [
              { name: "name", type: "text", label: "Name", required: true },
              { name: "email", type: "email", label: "Email", required: true },
              { name: "message", type: "textarea", label: "Message", required: true },
            ],
          },
        },
        { type: "social-icons", data: { platforms: [{ name: "Delivery", url: "#", icon: "🛵" }] } },
        { type: "cta", data: { heading: "Visit Aydin's Cafe", subtext: "Find us today!", buttonLabel: "Visit Aydin's Cafe", buttonLink: "/" } },
      ],
    },
  ],
}))

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
    const ctas = screen.getAllByText("Visit Aydin's Cafe")
    expect(ctas.length).toBeGreaterThanOrEqual(1)
  })
})
