import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("@/app/login/login-form", () => ({
  LoginForm: () => <div data-testid="login-form">Login Form</div>,
}))

import LoginPage from "@/app/login/page"

describe("LoginPage", () => {
  it("renders the page heading", () => {
    render(<LoginPage />)
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
  })

  it("renders the subheading", () => {
    render(<LoginPage />)
    expect(screen.getByText("Sign in to manage your cafe")).toBeInTheDocument()
  })

  it("renders the login form", () => {
    render(<LoginPage />)
    expect(screen.getByTestId("login-form")).toBeInTheDocument()
  })
})
