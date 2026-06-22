import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ToastContainer } from "@/components/ui/toast"

const mockUseToastContext = vi.fn()

vi.mock("@/hooks/useToast", () => ({
  useToastContext: () => mockUseToastContext(),
  ToastContext: { Provider: ({ children }: { children: React.ReactNode }) => children },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe("ToastContainer", () => {
  it("returns null when there are no toasts", () => {
    mockUseToastContext.mockReturnValue({ toasts: [], removeToast: vi.fn() })
    const { container } = render(<ToastContainer />)
    expect(container.innerHTML).toBe("")
  })

  it("renders a toast message", () => {
    mockUseToastContext.mockReturnValue({
      toasts: [{ id: "1", message: "Hello", variant: "info" }],
      removeToast: vi.fn(),
    })
    render(<ToastContainer />)
    expect(screen.getByText("Hello")).toBeInTheDocument()
  })

  it("renders multiple toasts", () => {
    mockUseToastContext.mockReturnValue({
      toasts: [
        { id: "1", message: "First", variant: "info" },
        { id: "2", message: "Second", variant: "success" },
      ],
      removeToast: vi.fn(),
    })
    render(<ToastContainer />)
    expect(screen.getByText("First")).toBeInTheDocument()
    expect(screen.getByText("Second")).toBeInTheDocument()
  })

  it("applies success variant styles", () => {
    mockUseToastContext.mockReturnValue({
      toasts: [{ id: "1", message: "Done", variant: "success" }],
      removeToast: vi.fn(),
    })
    render(<ToastContainer />)
    const toast = screen.getByText("Done").closest("div")
    expect(toast?.className).toContain("bg-green-50")
  })

  it("applies error variant styles", () => {
    mockUseToastContext.mockReturnValue({
      toasts: [{ id: "1", message: "Error", variant: "error" }],
      removeToast: vi.fn(),
    })
    render(<ToastContainer />)
    const toast = screen.getByText("Error").closest("div")
    expect(toast?.className).toContain("bg-red-50")
  })

  it("calls removeToast when dismiss button is clicked", async () => {
    const user = userEvent.setup()
    const removeToast = vi.fn()
    mockUseToastContext.mockReturnValue({
      toasts: [{ id: "1", message: "Dismiss me", variant: "info" }],
      removeToast,
    })
    render(<ToastContainer />)
    await user.click(screen.getByLabelText("Dismiss"))
    expect(removeToast).toHaveBeenCalledWith("1")
  })

  it("renders dismiss buttons for all toasts", () => {
    mockUseToastContext.mockReturnValue({
      toasts: [
        { id: "1", message: "One", variant: "info" },
        { id: "2", message: "Two", variant: "info" },
      ],
      removeToast: vi.fn(),
    })
    render(<ToastContainer />)
    expect(screen.getAllByLabelText("Dismiss")).toHaveLength(2)
  })
})
