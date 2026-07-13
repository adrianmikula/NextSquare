import type { Metadata } from "next"
import { DollarSign, ShoppingBag, TrendingUp, Clock } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
}

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-heading">Overview</h1>
        <p className="mt-1 text-sm text-muted">
          Welcome to your cafe dashboard
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4" style={{ gap: "var(--grid-gap)" }}>
        <StatCard
          title="Today's Revenue"
          value="—"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Today's Orders"
          value="—"
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <StatCard
          title="Menu Items"
          value="—"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Open Now"
          value="—"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <div className="mt-8 card bg-base-100 p-8 text-center" style={{ boxShadow: "var(--card-shadow, var(--theme-shadow-card))", border: "var(--card-border-toggle, var(--theme-border-width, 1px)) var(--theme-border-style, solid) var(--color-card-border)", transition: "box-shadow var(--transition-speed, 300ms) var(--motion-easing, ease), transform var(--transition-speed, 300ms) var(--motion-easing, ease)" }}>
        <p className="text-sm text-muted">
          Connect Square to see real-time revenue and order data.
        </p>
      </div>
    </div>
  )
}
