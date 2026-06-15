import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Sidebar } from "@/components/dashboard/sidebar"

const mockPathname = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockPathname.mockReturnValue("/dashboard")
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("Sidebar", () => {
  it("renders all navigation items", () => {
    render(<Sidebar />)
    expect(screen.getByText("Overview")).toBeDefined()
    expect(screen.getByText("Menu")).toBeDefined()
    expect(screen.getByText("Orders")).toBeDefined()
    expect(screen.getByText("Settings")).toBeDefined()
  })

  it("renders Log out button", () => {
    render(<Sidebar />)
    expect(screen.getByText("Log out")).toBeDefined()
  })

  it("renders Cafe Admin branding", () => {
    render(<Sidebar />)
    expect(screen.getByText("☕ Cafe Admin")).toBeDefined()
  })

  it("links to correct paths", () => {
    render(<Sidebar />)
    const menuLink = screen.getByText("Menu").closest("a")
    expect(menuLink?.getAttribute("href")).toBe("/dashboard/menu")
    const overviewLink = screen.getByText("Overview").closest("a")
    expect(overviewLink?.getAttribute("href")).toBe("/dashboard")
  })

  it("calls logout API and redirects on logout click", async () => {
    const originalLocation = window.location
    // @ts-expect-error mock
    delete window.location
    window.location = { href: "", assign: vi.fn() } as unknown as Location

    render(<Sidebar />)
    await userEvent.click(screen.getByText("Log out"))

    await vi.waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
      })
    })
    expect(window.location.href).toBe("/login")

    window.location = originalLocation
  })
})
