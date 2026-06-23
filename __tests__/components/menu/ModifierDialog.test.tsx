import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ModifierDialog } from "@/components/menu/ModifierDialog"

describe("ModifierDialog", () => {
  const singleSelectList: any = {
    id: "mod-list-1",
    type: "MODIFIER_LIST",
    modifierListData: {
      name: "Milk Choice",
      selectionType: "SINGLE",
      modifiers: [
        { id: "oat", type: "MODIFIER", modifierData: { name: "Oat Milk", priceMoney: { amount: 100, currency: "AUD" }, ordinal: 1 } },
        { id: "soy", type: "MODIFIER", modifierData: { name: "Soy Milk", priceMoney: { amount: 80, currency: "AUD" }, ordinal: 2 } },
        { id: "full", type: "MODIFIER", modifierData: { name: "Full Cream", ordinal: 3 } },
      ],
    },
  }

  const multiSelectList: any = {
    id: "mod-list-2",
    type: "MODIFIER_LIST",
    modifierListData: {
      name: "Extras",
      selectionType: "MULTIPLE",
      modifiers: [
        { id: "shot", type: "MODIFIER", modifierData: { name: "Extra Shot", priceMoney: { amount: 80, currency: "AUD" }, ordinal: 1 } },
        { id: "syrup", type: "MODIFIER", modifierData: { name: "Vanilla Syrup", priceMoney: { amount: 50, currency: "AUD" }, ordinal: 2 } },
      ],
    },
  }

  it("renders modifier list name", () => {
    render(
      <ModifierDialog
        modifierList={singleSelectList}
        selected={[]}
        onSelect={vi.fn()}
      />
    )
    expect(screen.getByText("Milk Choice")).toBeInTheDocument()
    expect(screen.getByText("Oat Milk")).toBeInTheDocument()
    expect(screen.getByText("Soy Milk")).toBeInTheDocument()
    expect(screen.getByText("Full Cream")).toBeInTheDocument()
  })

  it("calls onSelect with single modifier for SINGLE type", async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(
      <ModifierDialog
        modifierList={singleSelectList}
        selected={[]}
        onSelect={onSelect}
      />
    )
    await user.click(screen.getByText("Oat Milk"))
    expect(onSelect).toHaveBeenCalledWith([
      { id: "oat", name: "Oat Milk" },
    ])
  })

  it("toggles modifiers for MULTIPLE type", async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(
      <ModifierDialog
        modifierList={multiSelectList}
        selected={[]}
        onSelect={onSelect}
      />
    )
    await user.click(screen.getByText("Extra Shot"))
    expect(onSelect).toHaveBeenCalledWith([
      { id: "shot", name: "Extra Shot" },
    ])
  })

  it("deselects modifier when already selected in MULTIPLE mode", async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(
      <ModifierDialog
        modifierList={multiSelectList}
        selected={[{ id: "shot", name: "Extra Shot", priceMoney: { amount: 80, currency: "AUD" } }]}
        onSelect={onSelect}
      />
    )
    await user.click(screen.getByText("Extra Shot"))
    expect(onSelect).toHaveBeenCalledWith([])
  })

  it("shows price next to modifiers with cost", () => {
    render(
      <ModifierDialog
        modifierList={singleSelectList}
        selected={[]}
        onSelect={vi.fn()}
      />
    )
    expect(screen.getByText("+$1.00")).toBeInTheDocument()
    expect(screen.getByText("+$0.80")).toBeInTheDocument()
  })

  it("renders selected modifiers with amber background class", () => {
    const { container } = render(
      <ModifierDialog
        modifierList={singleSelectList}
        selected={[{ id: "oat", name: "Oat Milk" }]}
        onSelect={vi.fn()}
      />
    )
    const oatMilkBtn = screen.getByText("Oat Milk").closest("button")
    expect(oatMilkBtn?.className).toContain("bg-amber-50")
  })
})
