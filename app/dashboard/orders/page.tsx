import type { Metadata } from "next"
import { Client, Environment } from "square/legacy"
import { OrderTable } from "@/components/dashboard/order-table"

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
}

const { ordersApi } = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment:
    process.env.SQUARE_ENVIRONMENT === "production" ? Environment.Production : Environment.Sandbox,
})

export default async function OrdersPage() {
  let orders: Array<{
    id: string
    ticketName?: string
    state: string
    totalMoney?: { amount: bigint; currency: string }
    createdAt?: string
  }> = []

  try {
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString()

    const { result } = await ordersApi.searchOrders({
      locationIds: [process.env.SQUARE_LOCATION_ID!],
      query: {
        filter: {
          dateTimeFilter: {
            createdAt: { startAt: thirtyDaysAgo },
          },
        },
        sort: {
          sortField: "CREATED_AT",
          sortOrder: "DESC",
        },
      },
    })

    orders = (result.orders ?? []).map((order) => ({
      id: order.id ?? "",
      ticketName: order.ticketName ?? undefined,
      state: order.state ?? "",
      totalMoney: order.totalMoney?.amount
        ? {
            amount: order.totalMoney.amount,
            currency: order.totalMoney.currency ?? "AUD",
          }
        : undefined,
      createdAt: order.createdAt ?? undefined,
    }))
  } catch {
    // Square not configured or API error — show empty state
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Recent Orders</h1>
        <p className="mt-1 text-sm text-stone-500">
          Last 30 days of orders from Square
        </p>
      </div>

      <OrderTable orders={orders} />
    </div>
  )
}
