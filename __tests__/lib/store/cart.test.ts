import { describe, expect, it, beforeEach } from "vitest"

describe("useCartStore", () => {
  beforeEach(async () => {
    const { useCartStore } = await import("@/lib/store/cart")
    useCartStore.setState({ items: [], fulfillmentType: "PICKUP" })
  })

  it("adds an item to the cart", async () => {
    const { useCartStore } = await import("@/lib/store/cart")
    useCartStore.getState().addItem({
      catalogObjectId: "item-1",
      name: "Flat White",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 1,
      modifiers: [],
    })
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].name).toBe("Flat White")
    expect(state.items[0].quantity).toBe(1)
  })

  it("increments quantity when adding duplicate item", async () => {
    const { useCartStore } = await import("@/lib/store/cart")
    const item = {
      catalogObjectId: "item-1",
      name: "Flat White",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 1,
      modifiers: [],
    }
    useCartStore.getState().addItem(item)
    useCartStore.getState().addItem(item)
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].quantity).toBe(2)
  })

  it("adds separate items for different modifiers", async () => {
    const { useCartStore } = await import("@/lib/store/cart")
    useCartStore.getState().addItem({
      catalogObjectId: "item-1",
      name: "Latte",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 1,
      modifiers: [{ id: "oat", name: "Oat Milk", priceMoney: { amount: 100, currency: "AUD" } }],
    })
    useCartStore.getState().addItem({
      catalogObjectId: "item-1",
      name: "Latte",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 1,
      modifiers: [{ id: "soy", name: "Soy Milk", priceMoney: { amount: 80, currency: "AUD" } }],
    })
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(2)
  })

  it("removes an item from the cart", async () => {
    const { useCartStore } = await import("@/lib/store/cart")
    useCartStore.getState().addItem({
      catalogObjectId: "item-1",
      name: "Flat White",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 1,
      modifiers: [],
    })
    const id = useCartStore.getState().items[0].id
    useCartStore.getState().removeItem(id)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it("updates item quantity", async () => {
    const { useCartStore } = await import("@/lib/store/cart")
    useCartStore.getState().addItem({
      catalogObjectId: "item-1",
      name: "Flat White",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 1,
      modifiers: [],
    })
    const id = useCartStore.getState().items[0].id
    useCartStore.getState().updateQuantity(id, 3)
    expect(useCartStore.getState().items[0].quantity).toBe(3)
  })

  it("removes item when quantity set to 0", async () => {
    const { useCartStore } = await import("@/lib/store/cart")
    useCartStore.getState().addItem({
      catalogObjectId: "item-1",
      name: "Flat White",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 1,
      modifiers: [],
    })
    const id = useCartStore.getState().items[0].id
    useCartStore.getState().updateQuantity(id, 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it("sets fulfillment type", async () => {
    const { useCartStore } = await import("@/lib/store/cart")
    useCartStore.getState().setFulfillmentType("DELIVERY")
    expect(useCartStore.getState().fulfillmentType).toBe("DELIVERY")
  })

  it("clears the cart", async () => {
    const { useCartStore } = await import("@/lib/store/cart")
    useCartStore.getState().addItem({
      catalogObjectId: "item-1",
      name: "Flat White",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 1,
      modifiers: [],
    })
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it("computes item count from store items", async () => {
    const { useCartStore } = await import("@/lib/store/cart")
    useCartStore.getState().addItem({
      catalogObjectId: "item-1",
      name: "Flat White",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 2,
      modifiers: [],
    })
    useCartStore.getState().addItem({
      catalogObjectId: "item-2",
      name: "Latte",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 1,
      modifiers: [],
    })
    const state = useCartStore.getState()
    const count = state.items.reduce((sum, i) => sum + i.quantity, 0)
    expect(count).toBe(3)
  })

  it("computes subtotal including modifiers", async () => {
    const { useCartStore } = await import("@/lib/store/cart")
    useCartStore.getState().addItem({
      catalogObjectId: "item-1",
      name: "Latte",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 2,
      modifiers: [
        { id: "oat", name: "Oat Milk", priceMoney: { amount: 100, currency: "AUD" } },
      ],
    })
    const state = useCartStore.getState()
    const subtotal = state.items.reduce((sum, i) => {
      const itemTotal = i.priceMoney.amount * i.quantity
      const modifierTotal = i.modifiers.reduce(
        (mSum, m) => mSum + (m.priceMoney?.amount ?? 0) * i.quantity,
        0
      )
      return sum + itemTotal + modifierTotal
    }, 0)
    expect(subtotal).toBe(1300) // (550 + 100) * 2
  })

  it("persists state to localStorage", async () => {
    const { useCartStore } = await import("@/lib/store/cart")
    useCartStore.getState().addItem({
      catalogObjectId: "item-1",
      name: "Flat White",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 1,
      modifiers: [],
    })
    const stored = JSON.parse(localStorage.getItem("cafe-cart") ?? "{}")
    expect(stored.state.items).toHaveLength(1)
    expect(stored.state.items[0].name).toBe("Flat White")
  })
})
