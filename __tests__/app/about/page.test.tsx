import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("@/lib/cms", () => ({
  readCmsPages: () => [
    {
      slug: "about",
      label: "About Us",
      blocks: [
        { type: "hero", data: { headline: "Welcome", subheadline: "Aydin's Cafe in Joondalup", ctaLabel: "Visit Aydin's Cafe", ctaLink: "/contact" } },
        { type: "text", data: { heading: "Our Story", body: "Serving the community since 2020." } },
        { type: "hours", data: { schedule: [{ day: "Monday", open: "7:00", close: "15:00" }] } },
        { type: "testimonials", data: { items: [{ author: "Happy Customer", text: "Very tasty coffee!" }] } },
        { type: "callout", data: { quote: "Very tasty food and great service!" } },
        { type: "cta", data: { heading: "Visit Aydin's Cafe", subtext: "Come and try our menu", buttonLabel: "Visit Aydin's Cafe", buttonLink: "/contact" } },
      ],
    },
  ],
}))

import AboutPage from "@/app/about/page"

describe("AboutPage", () => {
  it("renders the page heading", () => {
    render(<AboutPage />)
    expect(screen.getByText("Welcome")).toBeInTheDocument()
  })

  it("renders the intro text", () => {
    render(<AboutPage />)
    expect(screen.getByText(/Aydin's Cafe in Joondalup/)).toBeInTheDocument()
  })

  it("renders the hours section", () => {
    render(<AboutPage />)
    expect(screen.getByText("Hours")).toBeInTheDocument()
    expect(screen.getByText("Monday")).toBeInTheDocument()
  })

  it("renders testimonials section", () => {
    render(<AboutPage />)
    expect(screen.getByText("What Our Customers Say")).toBeInTheDocument()
  })

  it("renders callout section", () => {
    render(<AboutPage />)
    const callouts = screen.getAllByText(/Very tasty/)
    expect(callouts.length).toBeGreaterThanOrEqual(1)
  })

  it("renders CTA section", () => {
    render(<AboutPage />)
    const ctas = screen.getAllByText("Visit Aydin's Cafe")
    expect(ctas.length).toBeGreaterThanOrEqual(1)
  })
})
