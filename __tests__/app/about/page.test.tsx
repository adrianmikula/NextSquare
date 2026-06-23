import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import AboutPage from "@/app/about/page"

describe("AboutPage", () => {
  it("renders the page heading", () => {
    render(<AboutPage />)
    expect(screen.getByText("Our Story")).toBeInTheDocument()
  })

  it("renders the intro paragraphs", () => {
    render(<AboutPage />)
    expect(screen.getByText(/Founded in 2020/)).toBeInTheDocument()
    expect(screen.getByText(/power of simple things done well/)).toBeInTheDocument()
  })

  it("renders all three value cards", () => {
    render(<AboutPage />)
    expect(screen.getByText("Quality Coffee")).toBeInTheDocument()
    expect(screen.getByText("Community First")).toBeInTheDocument()
    expect(screen.getByText("Great Service")).toBeInTheDocument()
  })

  it("renders value descriptions", () => {
    render(<AboutPage />)
    expect(screen.getByText(/sustainable farms/)).toBeInTheDocument()
    expect(screen.getByText(/gathering place for friends/)).toBeInTheDocument()
    expect(screen.getByText(/warm, welcoming experience/)).toBeInTheDocument()
  })
})
