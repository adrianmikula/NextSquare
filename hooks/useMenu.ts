"use client"

import useSWR from "swr"
import type { SquareCatalogItem, SquareCatalogCategory } from "@/types/square"

interface MenuData {
  items: SquareCatalogItem[]
  categories: SquareCatalogCategory[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useMenu() {
  const { data, error, isLoading } = useSWR<MenuData>(
    "/api/square/catalog",
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  )

  return {
    items: data?.items ?? [],
    categories: data?.categories ?? [],
    isLoading,
    isError: !!error,
  }
}
