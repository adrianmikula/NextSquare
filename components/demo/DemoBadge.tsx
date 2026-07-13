"use client"

import { isDemoMode } from "@/lib/demo/config"
import { FlaskConical } from "lucide-react"

export function DemoBadge() {
  if (!isDemoMode()) return null

  return (
    <div className="badge badge-primary badge-outline fixed bottom-4 left-4 z-[100] flex items-center gap-2 px-3 py-3 text-xs font-medium">
      <FlaskConical className="h-3.5 w-3.5" />
      Demo Mode
    </div>
  )
}
