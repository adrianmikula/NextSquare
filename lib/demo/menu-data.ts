import type { SquareCatalogItem, SquareCatalogCategory, SquareOrder, SquarePayment } from "@/types/square"

export const demoCategories: SquareCatalogCategory[] = [
  { id: "cat-coffee", type: "CATEGORY", categoryData: { name: "Coffee" } },
  { id: "cat-food", type: "CATEGORY", categoryData: { name: "Food" } },
  { id: "cat-pastries", type: "CATEGORY", categoryData: { name: "Pastries" } },
  { id: "cat-cold-drinks", type: "CATEGORY", categoryData: { name: "Cold Drinks" } },
]

export const demoMenuItems: SquareCatalogItem[] = [
  {
    id: "item-latte", type: "ITEM",
    itemData: {
      name: "Latte", description: "Espresso with steamed milk", categoryId: "cat-coffee",
      availableOnline: true,
      variations: [{ id: "var-latte-reg", type: "ITEM_VARIATION", itemVariationData: { itemId: "item-latte", name: "Regular", pricingType: "FIXED_PRICING", priceMoney: { amount: BigInt(550), currency: "AUD" } } }],
      modifiers: [
        { id: "mod-milk", type: "MODIFIER_LIST", modifierListData: { name: "Milk", selectionType: "SINGLE", modifiers: [
          { id: "mod-oat", type: "MODIFIER", modifierData: { name: "Oat Milk", priceMoney: { amount: BigInt(80), currency: "AUD" } } },
          { id: "mod-soy", type: "MODIFIER", modifierData: { name: "Soy Milk", priceMoney: { amount: BigInt(60), currency: "AUD" } } },
          { id: "mod-almond", type: "MODIFIER", modifierData: { name: "Almond Milk", priceMoney: { amount: BigInt(60), currency: "AUD" } } },
        ] } },
      ],
    },
    imageUrl: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400",
    categoryName: "Coffee",
  },
  {
    id: "item-flat-white", type: "ITEM",
    itemData: {
      name: "Flat White", description: "Double ristretto with silky milk", categoryId: "cat-coffee",
      availableOnline: true,
      variations: [{ id: "var-fw-reg", type: "ITEM_VARIATION", itemVariationData: { itemId: "item-flat-white", name: "Regular", pricingType: "FIXED_PRICING", priceMoney: { amount: BigInt(500), currency: "AUD" } } }],
      modifiers: [],
    },
    imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400",
    categoryName: "Coffee",
  },
  {
    id: "item-cappuccino", type: "ITEM",
    itemData: {
      name: "Cappuccino", description: "Espresso with frothy milk and cocoa", categoryId: "cat-coffee",
      availableOnline: true,
      variations: [{ id: "var-cap-reg", type: "ITEM_VARIATION", itemVariationData: { itemId: "item-cappuccino", name: "Regular", pricingType: "FIXED_PRICING", priceMoney: { amount: BigInt(500), currency: "AUD" } } }],
      modifiers: [],
    },
    imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400",
    categoryName: "Coffee",
  },
  {
    id: "item-long-black", type: "ITEM",
    itemData: {
      name: "Long Black", description: "Double espresso topped with hot water", categoryId: "cat-coffee",
      availableOnline: true,
      variations: [{ id: "var-lb-reg", type: "ITEM_VARIATION", itemVariationData: { itemId: "item-long-black", name: "Regular", pricingType: "FIXED_PRICING", priceMoney: { amount: BigInt(450), currency: "AUD" } } }],
      modifiers: [],
    },
    imageUrl: "https://images.unsplash.com/photo-1595434091143-b375ced5fe5c?w=400",
    categoryName: "Coffee",
  },
  {
    id: "item-avocado-toast", type: "ITEM",
    itemData: {
      name: "Avocado Toast", description: "Smashed avo on sourdough with dukkah", categoryId: "cat-food",
      availableOnline: true,
      variations: [{ id: "var-at-reg", type: "ITEM_VARIATION", itemVariationData: { itemId: "item-avocado-toast", name: "Regular", pricingType: "FIXED_PRICING", priceMoney: { amount: BigInt(1800), currency: "AUD" } } }],
      modifiers: [],
    },
    imageUrl: "https://images.unsplash.com/photo-1603046891744-76db6d1b6b1d?w=400",
    categoryName: "Food",
  },
  {
    id: "item-breakfast-bowl", type: "ITEM",
    itemData: {
      name: "Breakfast Bowl", description: "Granola, yogurt, fresh berries, honey", categoryId: "cat-food",
      availableOnline: true,
      variations: [{ id: "var-bb-reg", type: "ITEM_VARIATION", itemVariationData: { itemId: "item-breakfast-bowl", name: "Regular", pricingType: "FIXED_PRICING", priceMoney: { amount: BigInt(1600), currency: "AUD" } } }],
      modifiers: [],
    },
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
    categoryName: "Food",
  },
  {
    id: "item-croissant", type: "ITEM",
    itemData: {
      name: "Butter Croissant", description: "Flaky, golden, all-butter croissant", categoryId: "cat-pastries",
      availableOnline: true,
      variations: [{ id: "var-cr-reg", type: "ITEM_VARIATION", itemVariationData: { itemId: "item-croissant", name: "Regular", pricingType: "FIXED_PRICING", priceMoney: { amount: BigInt(600), currency: "AUD" } } }],
      modifiers: [],
    },
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038028a?w=400",
    categoryName: "Pastries",
  },
  {
    id: "item-cold-brew", type: "ITEM",
    itemData: {
      name: "Cold Brew", description: "Slow-steeped for 24 hours, served over ice", categoryId: "cat-cold-drinks",
      availableOnline: true,
      variations: [{ id: "var-cb-reg", type: "ITEM_VARIATION", itemVariationData: { itemId: "item-cold-brew", name: "Regular", pricingType: "FIXED_PRICING", priceMoney: { amount: BigInt(600), currency: "AUD" } } }],
      modifiers: [],
    },
    imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400",
    categoryName: "Cold Drinks",
  },
]

export function getDemoOrder(orderId: string): SquareOrder | null {
  const orders: Record<string, SquareOrder> = {
    "demo-order-001": {
      id: "demo-order-001",
      ticketName: "42",
      state: "COMPLETED",
      lineItems: [
        { uid: "li-1", catalogObjectId: "item-latte", quantity: "2", name: "Latte", basePriceMoney: { amount: BigInt(550), currency: "AUD" }, totalMoney: { amount: BigInt(1100), currency: "AUD" } },
        { uid: "li-2", catalogObjectId: "item-avocado-toast", quantity: "1", name: "Avocado Toast", basePriceMoney: { amount: BigInt(1800), currency: "AUD" }, totalMoney: { amount: BigInt(1800), currency: "AUD" } },
      ],
      fulfillments: [{ type: "PICKUP", state: "COMPLETED", pickupDetails: { recipient: { displayName: "Demo User", phoneNumber: "+61400000000" }, pickupAt: new Date(Date.now() + 15 * 60000).toISOString() } }],
      totalMoney: { amount: BigInt(2900), currency: "AUD" },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    "demo-order-002": {
      id: "demo-order-002",
      ticketName: "43",
      state: "IN_PROGRESS",
      lineItems: [
        { uid: "li-3", catalogObjectId: "item-flat-white", quantity: "1", name: "Flat White", basePriceMoney: { amount: BigInt(500), currency: "AUD" }, totalMoney: { amount: BigInt(500), currency: "AUD" } },
      ],
      fulfillments: [{ type: "PICKUP", state: "IN_PROGRESS", pickupDetails: { recipient: { displayName: "Test User", phoneNumber: "+61411111111" }, pickupAt: new Date(Date.now() + 10 * 60000).toISOString() } }],
      totalMoney: { amount: BigInt(500), currency: "AUD" },
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    "demo-order-003": {
      id: "demo-order-003",
      ticketName: "44",
      state: "PROPOSED",
      lineItems: [
        { uid: "li-4", catalogObjectId: "item-cold-brew", quantity: "1", name: "Cold Brew", basePriceMoney: { amount: BigInt(600), currency: "AUD" }, totalMoney: { amount: BigInt(600), currency: "AUD" } },
        { uid: "li-5", catalogObjectId: "item-croissant", quantity: "1", name: "Butter Croissant", basePriceMoney: { amount: BigInt(600), currency: "AUD" }, totalMoney: { amount: BigInt(600), currency: "AUD" } },
      ],
      fulfillments: [{ type: "SHIPMENT", state: "PROPOSED", shipmentDetails: { recipient: { displayName: "Delivery User", phoneNumber: "+61422222222", address: { addressLine1: "123 Test St", locality: "Melbourne", administrativeDistrictLevel1: "VIC", postalCode: "3000" } } } }],
      totalMoney: { amount: BigInt(1200), currency: "AUD" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }
  return orders[orderId] ?? null
}

export function createDemoOrder(): SquareOrder {
  return {
    id: `demo-order-${Date.now()}`,
    ticketName: String(Math.floor(Math.random() * 900) + 100),
    state: "PROPOSED",
    lineItems: [],
    fulfillments: [],
    totalMoney: { amount: BigInt(0), currency: "AUD" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function createDemoPayment(): SquarePayment {
  return {
    id: `demo-payment-${Date.now()}`,
    orderId: "",
    status: "COMPLETED",
    totalMoney: { amount: BigInt(0), currency: "AUD" },
    createdAt: new Date().toISOString(),
  }
}
