import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

let mockAddToast = vi.fn()
vi.mock("@/hooks/useToast", () => ({
  useToastContext: () => ({ addToast: mockAddToast, toasts: [], removeToast: vi.fn() }),
}))

const mockItems = [
  { id: "1", catalogObjectId: "item-1", name: "Flat White", priceMoney: { amount: 550, currency: "AUD" }, quantity: 1, modifiers: [] },
]

const mockAddItem = vi.fn()
const mockRemoveItem = vi.fn()
const mockUpdateQuantity = vi.fn()
const mockSetFulfillmentType = vi.fn((type: string) => {
  cartStoreState.fulfillmentType = type
})
const mockClearCart = vi.fn()

const cartStoreState = {
  items: mockItems,
  fulfillmentType: "PICKUP",
  addItem: mockAddItem,
  removeItem: mockRemoveItem,
  updateQuantity: mockUpdateQuantity,
  setFulfillmentType: mockSetFulfillmentType,
  clearCart: mockClearCart,
}

vi.mock("@/lib/store/cart", () => ({
  useCartStore: (selector: any) => {
    if (typeof selector === "function") return selector(cartStoreState)
    return cartStoreState
  },
  useCartSubtotal: () => 550,
  useCartTotalWithFee: () => 578,
}))

vi.mock("@/components/cart/DeliveryPickupToggle", () => ({
  DeliveryPickupToggle: ({ value, onChange }: any) => (
    <div data-testid="delivery-pickup-toggle">
      <button onClick={() => onChange("DELIVERY")}>Delivery</button>
      <button onClick={() => onChange("PICKUP")}>Pickup</button>
      <span>{value}</span>
    </div>
  ),
}))

vi.mock("@/components/checkout/OrderSummary", () => ({
  OrderSummary: () => <div data-testid="order-summary" />,
}))

vi.mock("@/components/checkout/PickupInfo", () => ({
  PickupInfo: ({ name, phone, onNameChange, onPhoneChange }: any) => (
    <div data-testid="pickup-info">
      <input data-testid="pickup-name" value={name} onChange={(e) => onNameChange(e.target.value)} />
      <input data-testid="pickup-phone" value={phone} onChange={(e) => onPhoneChange(e.target.value)} />
    </div>
  ),
}))

vi.mock("@/components/checkout/DeliveryInfo", () => ({
  DeliveryInfo: ({ name, phone, onNameChange, onPhoneChange }: any) => (
    <div data-testid="delivery-info">
      <input data-testid="delivery-name" value={name} onChange={(e) => onNameChange(e.target.value)} />
      <input data-testid="delivery-phone" value={phone} onChange={(e) => onPhoneChange(e.target.value)} />
    </div>
  ),
}))

vi.mock("@/components/checkout/SquarePaymentForm", () => ({
  SquarePaymentForm: ({ onSubmit }: any) => (
    <div data-testid="payment-form">
      <button onClick={() => onSubmit("test-nonce")}>Pay</button>
    </div>
  ),
}))

vi.mock("@/components/checkout/SquareFallback", () => ({
  SquareFallback: () => <div data-testid="square-fallback" />,
}))

let mockFetch: any
beforeEach(() => {
  vi.clearAllMocks()
  mockPush.mockReset()
  mockClearCart.mockReset()
  cartStoreState.items = mockItems
  cartStoreState.fulfillmentType = "PICKUP"
  global.fetch = vi.fn()
})

async function renderCheckout() {
  const CheckoutPage = (await import("@/app/checkout/page")).default
  return render(<CheckoutPage />)
}

describe("CheckoutPage", () => {
  it("shows empty cart message when no items", async () => {
    cartStoreState.items = []
    const { container } = await renderCheckout()
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument()
    expect(screen.getByText("Browse our menu")).toBeInTheDocument()
  })

  it("renders pickup info by default", async () => {
    await renderCheckout()
    expect(screen.getByTestId("pickup-info")).toBeInTheDocument()
    expect(screen.getByTestId("order-summary")).toBeInTheDocument()
    expect(screen.getByTestId("payment-form")).toBeInTheDocument()
    expect(screen.getByTestId("square-fallback")).toBeInTheDocument()
  })

  it("switches to delivery info when toggled", async () => {
    await renderCheckout()
    await userEvent.click(screen.getByText("Delivery"))
    expect(cartStoreState.fulfillmentType).toBe("DELIVERY")
  })

  it("validates customer name and phone before submitting", async () => {
    mockAddToast = vi.fn()

    await renderCheckout()
    await userEvent.click(screen.getByText("Pay"))
    expect(mockAddToast).toHaveBeenCalledWith("Please fill in your name and phone number", "error")
  })

  it("processes successful checkout flow", async () => {
    mockAddToast = vi.fn()

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ orderId: "order-123" }),
    })
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ paymentId: "pay-123", status: "COMPLETED" }),
    })
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ pointsEarned: 50, balanceAfterEarning: 200 }),
    })

    await renderCheckout()

    const nameInput = screen.getByTestId("pickup-name")
    const phoneInput = screen.getByTestId("pickup-phone")
    await userEvent.type(nameInput, "Adrian")
    await userEvent.type(phoneInput, "+61400123456")
    await userEvent.click(screen.getByText("Pay"))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(3)
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("/checkout/confirmation?orderId=order-123"))
      expect(mockClearCart).toHaveBeenCalled()
    })
  })

  it("handles payment failure gracefully", async () => {
    mockAddToast = vi.fn()

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ orderId: "order-123" }),
    })
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Card declined" }),
    })

    await renderCheckout()

    const nameInput = screen.getByTestId("pickup-name")
    const phoneInput = screen.getByTestId("pickup-phone")
    await userEvent.type(nameInput, "Adrian")
    await userEvent.type(phoneInput, "+61400123456")
    await userEvent.click(screen.getByText("Pay"))

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("Card declined", "error")
    })
  })

  it("continues even if loyalty enrollment fails", async () => {
    mockAddToast = vi.fn()

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ orderId: "order-123" }),
    })
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ paymentId: "pay-123", status: "COMPLETED" }),
    })
    ;(global.fetch as any).mockRejectedValueOnce(new Error("Loyalty API down"))

    await renderCheckout()

    const nameInput = screen.getByTestId("pickup-name")
    const phoneInput = screen.getByTestId("pickup-phone")
    await userEvent.type(nameInput, "Adrian")
    await userEvent.type(phoneInput, "+61400123456")
    await userEvent.click(screen.getByText("Pay"))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled()
      expect(mockClearCart).toHaveBeenCalled()
    })
  })
})
