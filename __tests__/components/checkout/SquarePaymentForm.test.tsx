import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SquarePaymentForm } from "@/components/checkout/SquarePaymentForm"

const mockTokenize = vi.fn()
const mockAttach = vi.fn()
const mockDestroy = vi.fn()
const mockCard = vi.fn()

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SQUARE_APP_ID", "app-123")
  vi.stubEnv("NEXT_PUBLIC_SQUARE_LOCATION_ID", "loc-456")

  mockTokenize.mockResolvedValue({ status: "OK", token: "cnon:card-token" })
  mockAttach.mockResolvedValue(undefined)
  mockDestroy.mockResolvedValue(undefined)

  mockCard.mockResolvedValue({
    tokenize: mockTokenize,
    attach: mockAttach,
    destroy: mockDestroy,
  })

  Object.defineProperty(window, "Square", {
    value: {
      payments: vi.fn().mockReturnValue({
        card: mockCard,
      }),
    },
    writable: true,
    configurable: true,
  })
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  delete (window as any).Square
})

async function renderForm() {
  const onError = vi.fn()
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const utils = render(
    <SquarePaymentForm amount={550} onError={onError} onSubmit={onSubmit} />,
  )
  await waitFor(() => {
    expect(mockAttach).toHaveBeenCalled()
  })
  return { onError, onSubmit, ...utils }
}

describe("SquarePaymentForm", () => {
  it("initializes the card form on mount", async () => {
    await renderForm()
    expect(mockCard).toHaveBeenCalled()
    expect(mockAttach).toHaveBeenCalledWith("#square-card-container")
  })

  it("renders the pay button with formatted amount", async () => {
    await renderForm()
    expect(screen.getByRole("button", { name: /pay/i })).toBeInTheDocument()
    expect(screen.getByText(/5\.50/)).toBeInTheDocument()
  })

  it("calls onSubmit with token when form is submitted", async () => {
    const { onSubmit } = await renderForm()
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /pay/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("cnon:card-token")
    })
  })

  it("shows processing state while submitting", async () => {
    let resolveSubmit!: (value: unknown) => void
    const onSubmit = vi.fn().mockReturnValue(new Promise((r) => { resolveSubmit = r }))
    render(<SquarePaymentForm amount={550} onError={vi.fn()} onSubmit={onSubmit} />)
    await waitFor(() => expect(mockAttach).toHaveBeenCalled())

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /pay/i }))
    expect(await screen.findByText("Processing...")).toBeInTheDocument()
    resolveSubmit(undefined)
  })

  it("calls onError when card tokenization fails", async () => {
    const onError = vi.fn()
    mockTokenize.mockResolvedValue({ status: "FAILED", errors: [{ code: "GENERIC_DECLINE", detail: "Card declined" }] })

    render(<SquarePaymentForm amount={550} onError={onError} onSubmit={vi.fn()} />)
    await waitFor(() => expect(mockAttach).toHaveBeenCalled())

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /pay/i }))
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Card declined")
    })
  })

  it("calls onError when Square SDK is not configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SQUARE_APP_ID", "")
    const onError = vi.fn()
    render(<SquarePaymentForm amount={550} onError={onError} onSubmit={vi.fn()} />)

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Square is not configured")
    })
  })

  it("disables the submit button while card is not loaded", () => {
    const onError = vi.fn()
    mockCard.mockImplementation(() => new Promise(() => {}))
    render(<SquarePaymentForm amount={550} onError={onError} onSubmit={vi.fn()} />)
    const button = screen.getByRole("button", { name: /pay/i })
    expect(button).toBeDisabled()
  })

  it("disables the submit button while processing", async () => {
    const onSubmit = vi.fn().mockReturnValue(new Promise(() => {}))
    render(<SquarePaymentForm amount={550} onError={vi.fn()} onSubmit={onSubmit} />)
    await waitFor(() => expect(mockAttach).toHaveBeenCalled())

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /pay/i }))
    expect(await screen.findByText("Processing...")).toBeInTheDocument()
    const button = screen.getByRole("button", { name: /processing/i })
    expect(button).toBeDisabled()
  })
})
