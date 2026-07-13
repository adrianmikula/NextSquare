import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { HoursLocation } from "@/components/hours-location"

describe("HoursLocation", () => {
  function renderHoursLocation() {
    return render(<HoursLocation />)
  }

  it("renders hours section with heading", () => {
    renderHoursLocation()
    expect(screen.getByText("Hours")).toBeInTheDocument()
  })

  it("renders all business hours", () => {
    renderHoursLocation()
    expect(screen.getByText("Monday - Friday")).toBeInTheDocument()
    expect(screen.getByText("7:00 AM - 3:00 PM")).toBeInTheDocument()
    expect(screen.getByText("Saturday")).toBeInTheDocument()
    expect(screen.getByText("8:00 AM - 2:00 PM")).toBeInTheDocument()
    expect(screen.getByText("Sunday")).toBeInTheDocument()
    expect(screen.getByText("Closed")).toBeInTheDocument()
  })

  it("renders location section", () => {
    renderHoursLocation()
    expect(screen.getByText("Location")).toBeInTheDocument()
    expect(screen.getByText("5/1 Winton Road")).toBeInTheDocument()
    expect(screen.getByText("Joondalup WA 6027")).toBeInTheDocument()
    expect(screen.getByText("Australia")).toBeInTheDocument()
  })
})
