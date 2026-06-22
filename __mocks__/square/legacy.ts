import { vi } from "vitest"

export const mockOrdersApi = {
  createOrder: vi.fn(),
  retrieveOrder: vi.fn(),
  searchOrders: vi.fn(),
}

export const mockPaymentsApi = {
  createPayment: vi.fn(),
  getPayment: vi.fn(),
}

export const mockLoyaltyApi = {
  searchLoyaltyAccounts: vi.fn(),
  createLoyaltyAccount: vi.fn(),
  calculateLoyaltyPoints: vi.fn(),
  retrieveLoyaltyProgram: vi.fn(),
}

export const Client = vi.fn(function () {
  return {
    ordersApi: mockOrdersApi,
    paymentsApi: mockPaymentsApi,
    loyaltyApi: mockLoyaltyApi,
  }
})

export const Environment = {
  Production: "production",
  Sandbox: "sandbox",
}
