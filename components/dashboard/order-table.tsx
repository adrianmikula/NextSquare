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
  OPEN: "badge-outline",
  COMPLETED: "badge-success",
  CANCELED: "badge-error",
}

export function OrderTable({ orders }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="card bg-base-100 p-12 text-center">
        <p className="text-sm text-muted">No orders yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden card bg-base-100">
      <table className="table table-zebra table-pin-rows text-sm">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left font-medium text-body">
              Order
            </th>
            <th className="px-4 py-3 text-left font-medium text-body">
              Status
            </th>
            <th className="px-4 py-3 text-right font-medium text-body">
              Total
            </th>
            <th className="px-4 py-3 text-right font-medium text-body">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-section">
              <td className="px-4 py-3 font-medium text-heading">
                #{order.ticketName ?? order.id.slice(-6)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`badge badge-sm ${stateColors[order.state] ?? ""}`}
                >
                  {stateLabels[order.state] ?? order.state}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-heading">
                {order.totalMoney
                  ? `$${(Number(order.totalMoney.amount) / 100).toFixed(2)}`
                  : "-"}
              </td>
              <td className="px-4 py-3 text-right text-muted">
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
