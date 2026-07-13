import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { Footer } from "@/components/layout/footer"

describe("Footer", () => {
  function renderFooter() {
    return render(<Footer />)
  }

  it("renders brand name and tagline", () => {
    renderFooter()
    expect(screen.getByText("Cafe Template")).toBeInTheDocument()
    expect(screen.getByText("Fresh coffee, great food, good vibes.")).toBeInTheDocument()
  })

  it("renders navigation links section", () => {
    renderFooter()
    expect(screen.getByText("Links")).toBeInTheDocument()
    expect(screen.getByText("Menu")).toBeInTheDocument()
    expect(screen.getByText("About")).toBeInTheDocument()
    expect(screen.getByText("Contact")).toBeInTheDocument()
  })

  it("renders social follow section", () => {
    renderFooter()
    expect(screen.getByText("Follow Us")).toBeInTheDocument()
    expect(screen.getByText("Instagram: @cafetemplate")).toBeInTheDocument()
  })

  it("renders copyright with current year", () => {
    renderFooter()
    const year = new Date().getFullYear()
    expect(screen.getByText(new RegExp(year.toString()))).toBeInTheDocument()
  })
})
