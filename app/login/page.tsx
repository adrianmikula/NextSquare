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
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
            <p className="mt-1 text-sm text-stone-500">
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
