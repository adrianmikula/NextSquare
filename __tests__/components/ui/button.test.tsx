import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button, buttonVariants } from "@/components/ui/button"

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText("Click me")).toBeInTheDocument()
  })

  it("renders as a button element", () => {
    render(<Button>Test</Button>)
    expect(screen.getByRole("button")).toBeInTheDocument()
  })

  it("forwards className", () => {
    render(<Button className="custom-class">Styled</Button>)
    const button = screen.getByText("Styled")
    expect(button.className).toContain("custom-class")
  })

  it("handles click events", async () => {
    const user = userEvent.setup()
    let clicked = false
    render(<Button onClick={() => { clicked = true }}>Click</Button>)
    await user.click(screen.getByText("Click"))
    expect(clicked).toBe(true)
  })

  it("respects disabled state", async () => {
    const user = userEvent.setup()
    let clicked = false
    render(<Button disabled onClick={() => { clicked = true }}>Disabled</Button>)
    await user.click(screen.getByText("Disabled"))
    expect(clicked).toBe(false)
  })

  it("forwards native button attributes", () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByText("Submit")).toHaveAttribute("type", "submit")
  })
})

describe("buttonVariants", () => {
  it("returns default variant class", () => {
    const result = buttonVariants()
    expect(result).toContain("bg-amber-600")
  })

  it("returns outline variant class", () => {
    const result = buttonVariants({ variant: "outline" })
    expect(result).toContain("border-amber-200")
  })
})
