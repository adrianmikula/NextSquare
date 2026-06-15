import { describe, expect, it, vi, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("swr", () => ({
  default: (key: string) => {
    if (key === "/api/square/catalog") {
      return {
        data: {
          items: [
            { id: "item-1", type: "ITEM", itemData: { name: "Flat White" } },
          ],
          categories: [
            { id: "cat-1", type: "CATEGORY", categoryData: { name: "Coffee" } },
          ],
        },
        error: undefined,
        isLoading: false,
      }
    }
    return { data: undefined, error: undefined, isLoading: true }
  },
}))

import { useMenu } from "@/hooks/useMenu"

function TestComponent() {
  const { items, categories, isLoading, isError } = useMenu()
  return (
    <div>
      <span data-testid="items">{items.length}</span>
      <span data-testid="categories">{categories.length}</span>
      <span data-testid="loading">{isLoading ? "true" : "false"}</span>
      <span data-testid="error">{isError ? "true" : "false"}</span>
      {items.length > 0 && <span data-testid="first-item">{items[0].itemData?.name}</span>}
    </div>
  )
}

describe("useMenu", () => {
  it("returns menu data from SWR", () => {
    render(<TestComponent />)
    expect(screen.getByTestId("items").textContent).toBe("1")
    expect(screen.getByTestId("categories").textContent).toBe("1")
    expect(screen.getByTestId("first-item").textContent).toBe("Flat White")
    expect(screen.getByTestId("loading").textContent).toBe("false")
    expect(screen.getByTestId("error").textContent).toBe("false")
  })
})
