import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

describe("Card", () => {
  it("renders children", () => {
    render(<Card><p>content</p></Card>)
    expect(screen.getByText("content")).toBeInTheDocument()
  })

  it("forwards className", () => {
    render(<Card className="custom-card">Styled</Card>)
    expect(screen.getByText("Styled").className).toContain("custom-card")
  })

  it("applies default card classes", () => {
    render(<Card>Default</Card>)
    expect(screen.getByText("Default").className).toContain("rounded-xl")
    expect(screen.getByText("Default").className).toContain("border-stone-200")
  })
})

describe("CardHeader", () => {
  it("renders children", () => {
    render(<CardHeader>Header</CardHeader>)
    expect(screen.getByText("Header")).toBeInTheDocument()
  })

  it("applies padding class", () => {
    render(<CardHeader>Padded</CardHeader>)
    expect(screen.getByText("Padded").className).toContain("p-6")
  })
})

describe("CardTitle", () => {
  it("renders as heading", () => {
    render(<CardTitle>Title</CardTitle>)
    const heading = screen.getByText("Title")
    expect(heading.tagName).toBe("H3")
  })

  it("applies styling classes", () => {
    render(<CardTitle>Styled</CardTitle>)
    expect(screen.getByText("Styled").className).toContain("font-semibold")
    expect(screen.getByText("Styled").className).toContain("text-stone-900")
  })
})

describe("CardDescription", () => {
  it("renders description text", () => {
    render(<CardDescription>Description</CardDescription>)
    expect(screen.getByText("Description")).toBeInTheDocument()
  })

  it("applies muted styling", () => {
    render(<CardDescription>Muted</CardDescription>)
    expect(screen.getByText("Muted").className).toContain("text-stone-500")
  })
})

describe("CardContent", () => {
  it("renders children", () => {
    render(<CardContent>Content</CardContent>)
    expect(screen.getByText("Content")).toBeInTheDocument()
  })

  it("applies padding class", () => {
    render(<CardContent>Padded</CardContent>)
    expect(screen.getByText("Padded").className).toContain("p-6")
    expect(screen.getByText("Padded").className).toContain("pt-0")
  })
})
