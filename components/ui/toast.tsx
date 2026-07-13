"use client"

import { X } from "lucide-react"
import { useToastContext, type ToastVariant } from "@/hooks/useToast"

const variantStyles: Record<ToastVariant, string> = {
  success: "alert-success",
  error: "alert-error",
  info: "alert-info",
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastContext()

  if (toasts.length === 0) return null

  return (
    <div className="toast toast-top toast-end z-[100]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`alert ${variantStyles[toast.variant]}`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
