import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold" style={{ color: "var(--color-card-border)" }}>404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-heading">
        Page not found
      </h2>
      <p className="mt-2 text-body">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className={cn(buttonVariants(), "no-underline")}
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
