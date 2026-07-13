import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useToastState, ToastContext } from "@/hooks/useToast"

describe("useToastState", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("starts with empty toasts", () => {
    const { result } = renderHook(() => useToastState())
    expect(result.current.toasts).toHaveLength(0)
  })

  it("adds a toast with default variant", () => {
    const { result } = renderHook(() => useToastState())

    act(() => {
      result.current.addToast("Hello")
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe("Hello")
    expect(result.current.toasts[0].variant).toBe("info")
  })

  it("adds a toast with a custom variant", () => {
    const { result } = renderHook(() => useToastState())

    act(() => {
      result.current.addToast("Error!", "error")
    })

    expect(result.current.toasts[0].variant).toBe("error")
  })

  it("adds a toast with success variant", () => {
    const { result } = renderHook(() => useToastState())

    act(() => {
      result.current.addToast("Done!", "success")
    })

    expect(result.current.toasts[0].variant).toBe("success")
  })

  it("removes a toast by id", () => {
    const { result } = renderHook(() => useToastState())

    act(() => {
      result.current.addToast("Temp")
    })

    const id = result.current.toasts[0].id

    act(() => {
      result.current.removeToast(id)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it("auto-removes toast after 5 seconds", () => {
    const { result } = renderHook(() => useToastState())

    act(() => {
      result.current.addToast("Auto remove")
    })

    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it("handles multiple toasts", () => {
    const { result } = renderHook(() => useToastState())

    act(() => {
      result.current.addToast("First", "info")
      result.current.addToast("Second", "success")
      result.current.addToast("Third", "error")
    })

    expect(result.current.toasts).toHaveLength(3)
    expect(result.current.toasts.map((t) => t.message)).toEqual(["First", "Second", "Third"])
  })
})

describe("ToastContext", () => {
  it("provides default empty context", () => {
    expect(ToastContext).toBeDefined()
    expect(ToastContext.Provider).toBeDefined()
  })
})
