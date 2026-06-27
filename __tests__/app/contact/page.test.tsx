import { describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"

vi.mock("@/components/google-maps", () => ({
  GoogleMaps: () => <div data-testid="google-maps">Map</div>,
}))

import ContactPage from "@/app/contact/page"

describe("ContactPage", () => {
  it("renders the page heading", () => {
    render(<ContactPage />)
    expect(screen.getByText("Contact Us")).toBeInTheDocument()
  })

  it("renders the subheading", () => {
    render(<ContactPage />)
    expect(screen.getByText(/We would love to hear from you/)).toBeInTheDocument()
  })

  it("renders all contact details", async () => {
    render(<ContactPage />)
    await waitFor(() => expect(screen.getByText("Address")).toBeInTheDocument())
    expect(screen.getByText("123 Coffee Lane, Melbourne VIC 3000")).toBeInTheDocument()
    expect(screen.getByText("Phone")).toBeInTheDocument()
    expect(screen.getByText("(03) 9000 0000")).toBeInTheDocument()
    expect(screen.getByText("Email")).toBeInTheDocument()
    expect(screen.getByText("hello@cafetemplate.com")).toBeInTheDocument()
    expect(screen.getByText("Hours")).toBeInTheDocument()
    expect(screen.getByText("Mon-Fri 7am-3pm, Sat 8am-4pm, Sun 8am-2pm")).toBeInTheDocument()
  })

  it("renders the Google Maps embed", async () => {
    render(<ContactPage />)
    await waitFor(() => expect(screen.getByTestId("google-maps")).toBeInTheDocument())
  })
})
