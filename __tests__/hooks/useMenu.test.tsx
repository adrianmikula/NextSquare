import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

type SwrMockConfig = {
  data?: any
  error?: any
  isLoading?: boolean
}

let swrConfig: SwrMockConfig = {}

vi.mock("swr", () => ({
  default: (key: string) => {
    if (key === "/api/square/catalog") {
      return {
        data: swrConfig.data,
        error: swrConfig.error,
        isLoading: swrConfig.isLoading ?? false,
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

beforeEach(() => {
  swrConfig = {}
})

describe("useMenu", () => {
  it("returns menu data from SWR", () => {
    swrConfig = {
      data: {
        items: [{ id: "item-1", itemData: { name: "Flat White" } }],
        categories: [{ id: "cat-1", categoryData: { name: "Coffee" } }],
      },
      isLoading: false,
    }
    render(<TestComponent />)
    expect(screen.getByTestId("items").textContent).toBe("1")
    expect(screen.getByTestId("categories").textContent).toBe("1")
    expect(screen.getByTestId("first-item").textContent).toBe("Flat White")
    expect(screen.getByTestId("loading").textContent).toBe("false")
    expect(screen.getByTestId("error").textContent).toBe("false")
  })

  it("returns loading state", () => {
    swrConfig = { isLoading: true }
    render(<TestComponent />)
    expect(screen.getByTestId("loading").textContent).toBe("true")
  })

  it("returns error state", () => {
    swrConfig = { error: new Error("Failed to fetch"), isLoading: false }
    render(<TestComponent />)
    expect(screen.getByTestId("error").textContent).toBe("true")
  })

  it("defaults to empty arrays when data is undefined", () => {
    swrConfig = { isLoading: false }
    render(<TestComponent />)
    expect(screen.getByTestId("items").textContent).toBe("0")
    expect(screen.getByTestId("categories").textContent).toBe("0")
  })

  it("handles missing nested fields gracefully", () => {
    swrConfig = {
      data: { items: [{ id: "item-1" }], categories: [] },
      isLoading: false,
    }
    render(<TestComponent />)
    expect(screen.getByTestId("items").textContent).toBe("1")
    expect(screen.getByTestId("categories").textContent).toBe("0")
  })
})
