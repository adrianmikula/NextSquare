import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MenuItemEditor } from "@/components/dashboard/menu-item-editor"

const mockItem = {
  id: "item-1",
  name: "Flat White",
  description: "Smooth espresso drink",
  priceMoney: { amount: 550, currency: "AUD" },
  availableForOnline: true,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("MenuItemEditor", () => {
  it("renders all fields with existing values", () => {
    render(
      <MenuItemEditor item={mockItem} onSaved={() => {}} onCancel={() => {}} />
    )
    expect(screen.getByDisplayValue("Flat White")).toBeDefined()
    expect(screen.getByDisplayValue("Smooth espresso drink")).toBeDefined()
    expect(screen.getByDisplayValue("5.5")).toBeDefined()
    expect(screen.getByText("Available online")).toBeDefined()
  })

  it("renders Save and Cancel buttons", () => {
    render(
      <MenuItemEditor item={mockItem} onSaved={() => {}} onCancel={() => {}} />
    )
    expect(screen.getByRole("button", { name: /save/i })).toBeDefined()
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDefined()
  })

  it("calls onCancel when no changes and Save is clicked", async () => {
    const onCancel = vi.fn()
    render(
      <MenuItemEditor item={mockItem} onSaved={() => {}} onCancel={onCancel} />
    )
    await userEvent.click(screen.getByRole("button", { name: /save/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it("calls onSaved on successful PATCH", async () => {
    const onSaved = vi.fn()
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      })
    )
    render(
      <MenuItemEditor item={mockItem} onSaved={onSaved} onCancel={() => {}} />
    )

    const nameInput = screen.getByDisplayValue("Flat White")
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, "Latte")

    await userEvent.click(screen.getByRole("button", { name: /save/i }))

    await vi.waitFor(() => {
      expect(onSaved).toHaveBeenCalled()
    })
    vi.unstubAllGlobals()
  })

  it("shows error message on failed PATCH", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: "Version mismatch" }),
      })
    )
    render(
      <MenuItemEditor item={mockItem} onSaved={() => {}} onCancel={() => {}} />
    )

    const nameInput = screen.getByDisplayValue("Flat White")
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, "Latte")

    await userEvent.click(screen.getByRole("button", { name: /save/i }))

    expect(await screen.findByText("Version mismatch")).toBeDefined()
    vi.unstubAllGlobals()
  })

  it("shows network error message on fetch failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error"))
    )
    render(
      <MenuItemEditor item={mockItem} onSaved={() => {}} onCancel={() => {}} />
    )

    const nameInput = screen.getByDisplayValue("Flat White")
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, "Latte")

    await userEvent.click(screen.getByRole("button", { name: /save/i }))

    expect(
      await screen.findByText("Network error")
    ).toBeDefined()
    vi.unstubAllGlobals()
  })

  it("handles item without priceMoney", () => {
    const noPriceItem = { ...mockItem, priceMoney: undefined }
    render(
      <MenuItemEditor
        item={noPriceItem}
        onSaved={() => {}}
        onCancel={() => {}}
      />
    )
    expect(screen.getByDisplayValue("0")).toBeDefined()
  })

  it("handles item without description", () => {
    const noDescItem = { ...mockItem, description: undefined }
    render(
      <MenuItemEditor
        item={noDescItem}
        onSaved={() => {}}
        onCancel={() => {}}
      />
    )
    const textareas = screen.getAllByRole("textbox")
    expect(textareas.some((t) => (t as HTMLTextAreaElement).value === "")).toBe(
      true
    )
  })
})
