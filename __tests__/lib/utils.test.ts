import { describe, expect, it } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2")
  })

  it("handles conditional classes via clsx", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible")
  })

  it("merges conflicting Tailwind classes (last wins)", () => {
    expect(cn("px-4", "px-6")).toBe("px-6")
  })

  it("handles array inputs", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c")
  })

  it("handles undefined and null", () => {
    expect(cn("a", undefined, null, "b")).toBe("a b")
  })
})
