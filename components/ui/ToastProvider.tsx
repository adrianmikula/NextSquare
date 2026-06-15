"use client"

import { ToastContext, useToastState } from "@/hooks/useToast"

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, addToast, removeToast } = useToastState()

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}
