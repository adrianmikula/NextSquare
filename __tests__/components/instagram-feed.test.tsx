import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { InstagramFeed } from "@/components/instagram-feed"

describe("InstagramFeed", () => {
  function renderInstagramFeed() {
    return render(<InstagramFeed />)
  }

  it("renders heading and handle", () => {
    renderInstagramFeed()
    expect(screen.getByText("Follow Us on Instagram")).toBeInTheDocument()
    expect(screen.getByText("@cafetemplate")).toBeInTheDocument()
  })

  it("renders all four placeholder images", () => {
    renderInstagramFeed()
    expect(screen.getByAltText("Coffee art")).toBeInTheDocument()
    expect(screen.getByAltText("Pastries")).toBeInTheDocument()
    expect(screen.getByAltText("Cafe interior")).toBeInTheDocument()
    expect(screen.getByAltText("Coffee beans")).toBeInTheDocument()
  })

  it("links each image to instagram.com", () => {
    renderInstagramFeed()
    const links = screen.getAllByRole("link")
    links.forEach((link) => {
      expect(link).toHaveAttribute("href", "https://instagram.com")
      expect(link).toHaveAttribute("target", "_blank")
      expect(link).toHaveAttribute("rel", "noopener noreferrer")
    })
  })
})
