import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Client, Environment } from "square/legacy"
import { MenuItemEditorWrapper } from "./menu-item-editor-wrapper"
import { requireEnv } from "@/lib/env"

export const metadata: Metadata = {
  title: "Edit Menu Item",
  robots: { index: false, follow: false },
}

const { catalogApi } = new Client({
  accessToken: requireEnv("SQUARE_ACCESS_TOKEN"),
  environment:
    requireEnv("SQUARE_ENVIRONMENT") === "production" ? Environment.Production : Environment.Sandbox,
})

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { result } = await catalogApi.retrieveCatalogObject(id, true)
  const catalogObject = result.object
  if (!catalogObject) notFound()

  const itemData = catalogObject.itemData
  const variation = itemData?.variations?.[0]?.itemVariationData

  const item = {
    id: catalogObject.id,
    name: itemData?.name ?? "Untitled",
    description: itemData?.description ?? undefined,
    priceMoney: variation?.priceMoney
      ? {
          amount: Number(variation.priceMoney.amount),
          currency: variation.priceMoney.currency ?? "AUD",
        }
      : undefined,
    availableForOnline: itemData?.availableOnline ?? true,
    type: catalogObject.type,
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Edit Menu Item</h1>
        <p className="mt-1 text-sm text-stone-500">{item.name}</p>
      </div>

      <div className="max-w-2xl rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <MenuItemEditorWrapper item={item} />
      </div>
    </div>
  )
}
