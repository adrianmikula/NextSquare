"use client"

import useSWR from "swr"
import type { OrderStatus } from "@/types/order"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useOrderStatus(orderId: string | undefined) {
  const { data, error, isLoading } = useSWR<OrderStatus>(
    orderId ? `/api/square/order/${orderId}` : null,
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  )

  return {
    order: data ?? null,
    isLoading,
    isError: !!error,
  }
}
