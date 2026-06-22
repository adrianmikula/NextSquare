import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

describe("Footer", () => {
  async function renderFooter() {
    const { Footer } = await import("@/components/layout/footer")
    return render(<Footer />)
  }

  it("renders brand name and tagline", async () => {
    await renderFooter()
    expect(screen.getByText("Cafe Template")).toBeInTheDocument()
    expect(screen.getByText("Fresh coffee, great food, good vibes.")).toBeInTheDocument()
  })

  it("renders navigation links section", async () => {
    await renderFooter()
    expect(screen.getByText("Links")).toBeInTheDocument()
    expect(screen.getByText("Menu")).toBeInTheDocument()
    expect(screen.getByText("About")).toBeInTheDocument()
    expect(screen.getByText("Contact")).toBeInTheDocument()
  })

  it("renders social follow section", async () => {
    await renderFooter()
    expect(screen.getByText("Follow Us")).toBeInTheDocument()
    expect(screen.getByText("Instagram: @cafetemplate")).toBeInTheDocument()
  })

  it("renders copyright with current year", async () => {
    await renderFooter()
    const year = new Date().getFullYear()
    expect(screen.getByText(new RegExp(year.toString()))).toBeInTheDocument()
  })
})
