import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
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
    expect(screen.getByText("Visit Aydin's Cafe")).toBeInTheDocument()
  })
})
