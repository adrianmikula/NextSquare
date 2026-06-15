"use client"

import { isDemoMode } from "@/lib/demo/config"
import { FlaskConical } from "lucide-react"

export function DemoBadge() {
  if (!isDemoMode()) return null

  return (
    <div className="fixed bottom-4 left-4 z-[100] flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800 shadow-lg">
      <FlaskConical className="h-3.5 w-3.5" />
      Demo Mode
    </div>
  )
}
