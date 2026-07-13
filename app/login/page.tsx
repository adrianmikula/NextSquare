import type { Metadata } from "next"
import { Suspense } from "react"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Dashboard Login",
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full container-max">
        <div className="card bg-base-100 p-8" style={{ boxShadow: "var(--card-shadow, var(--theme-shadow-card))", border: "var(--card-border-toggle, var(--theme-border-width, 1px)) var(--theme-border-style, solid) var(--color-card-border)", transition: "box-shadow var(--transition-speed, 300ms) var(--motion-easing, ease), transform var(--transition-speed, 300ms) var(--motion-easing, ease)" }}>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-heading">Dashboard</h1>
            <p className="mt-1 text-sm text-muted">
              Sign in to manage your cafe
            </p>
          </div>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
