interface Order {
  id: string
  ticketName?: string
  state: string
  totalMoney?: { amount: bigint; currency: string }
  createdAt?: string
}

interface OrderTableProps {
  orders: Order[]
}

const stateLabels: Record<string, string> = {
  OPEN: "Open",
  COMPLETED: "Completed",
  CANCELED: "Canceled",
}

const stateColors: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELED: "bg-red-100 text-red-700",
}

export function OrderTable({ orders }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
        <p className="text-sm text-stone-500">No orders yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50">
            <th className="px-4 py-3 text-left font-medium text-stone-600">
              Order
            </th>
            <th className="px-4 py-3 text-left font-medium text-stone-600">
              Status
            </th>
            <th className="px-4 py-3 text-right font-medium text-stone-600">
              Total
            </th>
            <th className="px-4 py-3 text-right font-medium text-stone-600">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-stone-50">
              <td className="px-4 py-3 font-medium text-stone-900">
                #{order.ticketName ?? order.id.slice(-6)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    stateColors[order.state] ?? "bg-stone-100 text-stone-600"
                  }`}
                >
                  {stateLabels[order.state] ?? order.state}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-stone-900">
                {order.totalMoney
                  ? `$${(Number(order.totalMoney.amount) / 100).toFixed(2)}`
                  : "-"}
              </td>
              <td className="px-4 py-3 text-right text-stone-500">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
