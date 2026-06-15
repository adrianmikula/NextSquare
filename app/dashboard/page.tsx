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
        <h1 className="text-2xl font-bold text-stone-900">Overview</h1>
        <p className="mt-1 text-sm text-stone-500">
          Welcome to your cafe dashboard
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="mt-8 rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-stone-500">
          Connect Square to see real-time revenue and order data.
        </p>
      </div>
    </div>
  )
}
