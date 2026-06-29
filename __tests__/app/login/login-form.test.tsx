import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockGet = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => ({ get: mockGet }),
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    type,
  }: {
    children: React.ReactNode
    disabled?: boolean
    type?: "submit" | "reset" | "button"
  }) => (
    <button type={type ?? "button"} disabled={disabled}>
      {children}
    </button>
  ),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockGet.mockReturnValue(null)
})

async function renderLoginForm() {
  const { LoginForm } = await import("@/app/login/login-form")
  return render(<LoginForm />)
}

describe("LoginForm", () => {
  it("renders password input and send code button", async () => {
    await renderLoginForm()
    expect(
      screen.getByPlaceholderText("Enter dashboard password")
    ).toBeDefined()
    expect(screen.getByRole("button", { name: "Send Code" })).toBeDefined()
  })

  it("shows error on failed login", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: "Invalid password" }),
      })
    )
    await renderLoginForm()

    const input = screen.getByPlaceholderText("Enter dashboard password")
    await userEvent.type(input, "wrong-password")
    await userEvent.click(screen.getByRole("button", { name: "Send Code" }))

    expect(await screen.findByText("Invalid password")).toBeDefined()
    vi.unstubAllGlobals()
  })

  it("calls router.push with redirect param on success", async () => {
    mockGet.mockReturnValue("/dashboard/menu")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    )
    await renderLoginForm()

    const passwordInput = screen.getByPlaceholderText("Enter dashboard password")
    await userEvent.type(passwordInput, "correct-password")
    await userEvent.click(screen.getByRole("button", { name: "Send Code" }))

    const codeInput = await screen.findByPlaceholderText("Enter 6-digit code")
    await userEvent.type(codeInput, "123456")
    await userEvent.click(screen.getByRole("button", { name: "Verify" }))

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/menu")
    })
    expect(mockRefresh).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it("redirects to /dashboard when no redirect param", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    )
    await renderLoginForm()

    const passwordInput = screen.getByPlaceholderText("Enter dashboard password")
    await userEvent.type(passwordInput, "correct-password")
    await userEvent.click(screen.getByRole("button", { name: "Send Code" }))

    const codeInput = await screen.findByPlaceholderText("Enter 6-digit code")
    await userEvent.type(codeInput, "123456")
    await userEvent.click(screen.getByRole("button", { name: "Verify" }))

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard")
    })
    vi.unstubAllGlobals()
  })

  it("shows generic error on fetch failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")))
    await renderLoginForm()

    const input = screen.getByPlaceholderText("Enter dashboard password")
    await userEvent.type(input, "any-password")
    await userEvent.click(screen.getByRole("button", { name: "Send Code" }))

    expect(
      await screen.findByText("An error occurred. Please try again.")
    ).toBeDefined()
    vi.unstubAllGlobals()
  })

  it("shows loading state while signing in", async () => {
    let resolveFetch: (v: unknown) => void
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveFetch = resolve
        })
      )
    )
    await renderLoginForm()

    const input = screen.getByPlaceholderText("Enter dashboard password")
    await userEvent.type(input, "password")
    await userEvent.click(screen.getByRole("button", { name: "Send Code" }))

    expect(screen.getByRole("button", { name: "Verifying..." })).toBeDefined()
    resolveFetch!({ ok: true, json: () => Promise.resolve({ success: true }) })
    vi.unstubAllGlobals()
  })
})
