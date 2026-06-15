"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useCartStore, useCartSubtotal } from "@/lib/store/cart"
import { DeliveryPickupToggle } from "@/components/cart/DeliveryPickupToggle"
import { OrderSummary } from "@/components/checkout/OrderSummary"
import { PickupInfo } from "@/components/checkout/PickupInfo"
import { DeliveryInfo } from "@/components/checkout/DeliveryInfo"
import { SquarePaymentForm } from "@/components/checkout/SquarePaymentForm"
import { SquareFallback } from "@/components/checkout/SquareFallback"
import type { DeliveryAddress, CustomerInfo } from "@/types/order"

const defaultAddress: DeliveryAddress = {
  addressLine1: "",
  addressLine2: "",
  locality: "",
  administrativeDistrictLevel1: "",
  postalCode: "",
}

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const fulfillmentType = useCartStore((s) => s.fulfillmentType)
  const setFulfillmentType = useCartStore((s) => s.setFulfillmentType)
  const clearCart = useCartStore((s) => s.clearCart)
  const subtotal = useCartSubtotal()

  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>(defaultAddress)
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

  const totalWithFee = subtotal + Math.round(subtotal * 0.05)

  const handlePaymentSubmit = useCallback(
    async (nonce: string) => {
      if (!customerName || !customerPhone) {
        setError("Please fill in your name and phone number")
        return
      }

      if (fulfillmentType === "DELIVERY") {
        const addr = deliveryAddress
        if (!addr.addressLine1 || !addr.locality || !addr.administrativeDistrictLevel1 || !addr.postalCode) {
          setError("Please fill in your delivery address")
          return
        }
      }

      setError(null)

      try {
        const idempotencyKey = `${Date.now()}-${crypto.randomUUID()}`

        const customerInfo: CustomerInfo = {
          name: customerName,
          phone: customerPhone,
        }

        const fulfillmentDetails =
          fulfillmentType === "PICKUP"
            ? { pickupAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() }
            : {
                address: {
                  addressLine1: deliveryAddress.addressLine1,
                  addressLine2: deliveryAddress.addressLine2,
                  locality: deliveryAddress.locality,
                  administrativeDistrictLevel1:
                    deliveryAddress.administrativeDistrictLevel1,
                  postalCode: deliveryAddress.postalCode,
                },
                deliveryNotes,
              }

        const orderRes = await fetch("/api/square/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lineItems: items,
            customerInfo,
            fulfillmentType,
            fulfillmentDetails,
            idempotencyKey,
          }),
        })

        if (!orderRes.ok) {
          const errData = await orderRes.json()
          throw new Error(errData.error ?? "Failed to create order")
        }

        const { orderId } = await orderRes.json()

        const paymentRes = await fetch("/api/square/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nonce,
            orderId,
            idempotencyKey: `${idempotencyKey}-payment`,
            amount: totalWithFee,
            currency: "AUD",
          }),
        })

        if (!paymentRes.ok) {
          const errData = await paymentRes.json()
          throw new Error(errData.error ?? "Payment failed")
        }

        clearCart()
        router.push(`/checkout/confirmation?orderId=${orderId}`)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        )
      }
    },
    [
      customerName,
      customerPhone,
      fulfillmentType,
      deliveryAddress,
      deliveryNotes,
      items,
      totalWithFee,
      clearCart,
      router,
    ]
  )

  if (items.length === 0) {
    return (
      <div className="bg-stone-50 py-20 text-center">
        <p className="text-lg text-stone-500">Your cart is empty.</p>
        <a
          href="/menu"
          className="mt-4 inline-block text-sm font-medium text-amber-700 hover:underline"
        >
          Browse our menu
        </a>
      </div>
    )
  }

  return (
    <div className="bg-stone-50 py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            Checkout
          </h1>
          <DeliveryPickupToggle
            value={fulfillmentType}
            onChange={setFulfillmentType}
          />
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {fulfillmentType === "PICKUP" ? (
            <PickupInfo
              name={customerName}
              phone={customerPhone}
              onNameChange={setCustomerName}
              onPhoneChange={setCustomerPhone}
            />
          ) : (
            <DeliveryInfo
              name={customerName}
              phone={customerPhone}
              address={deliveryAddress}
              deliveryNotes={deliveryNotes}
              onNameChange={setCustomerName}
              onPhoneChange={setCustomerPhone}
              onAddressChange={(field, value) =>
                setDeliveryAddress((prev) => ({ ...prev, [field]: value }))
              }
              onNotesChange={setDeliveryNotes}
            />
          )}

          <OrderSummary />

          <SquarePaymentForm
            amount={totalWithFee}
            currency="AUD"
            onError={(msg) => setError(msg)}
            onSubmit={handlePaymentSubmit}
          />

          <SquareFallback />
        </div>
      </div>
    </div>
  )
}
