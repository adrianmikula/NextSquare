"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isDemoMode } from "@/lib/demo/config"
import { DIMENSION_NAMES } from "@/lib/dimensions/client"
import type { DimensionName, Variant } from "@/lib/dimensions/client"
import { X } from "lucide-react"

export interface BundleInfo {
  id: string
  name: string
  description?: string
  dimensions: Record<DimensionName, Variant>
}

type Tab = "bundles" | DimensionName

const DIMENSION_LABELS: Record<DimensionName, string> = {
  spatial: "Layout",
  color: "Color",
  typography: "Typography",
  wording: "Text",
  imagery: "Imagery",
  components: "Components",
  rhythm: "Rhythm",
  motion: "Animation",
}

const DIMENSION_DESCRIPTIONS: Record<DimensionName, string> = {
  spatial: "Page layout and block composition",
  color: "Color palette",
  typography: "Font pairing and scale",
  wording: "Tone of voice",
  imagery: "Image sizing and treatment",
  components: "Card, button, nav styles",
  rhythm: "Section spacing and density",
  motion: "Transitions and scroll effects",
}

function getBundleByName(bundles: BundleInfo[], bundleId: string): BundleInfo | undefined {
  return bundles.find((b) => b.id === bundleId)
}

function bundleDefaults(bundles: BundleInfo[], bundleId: string): Record<DimensionName, Variant> {
  const b = getBundleByName(bundles, bundleId)
  if (b) return { ...b.dimensions }
  const state = {} as Record<DimensionName, Variant>
  for (const dim of DIMENSION_NAMES) state[dim] = "A"
  return state
}

export function DemoModePopup({ bundles = [] }: { bundles?: BundleInfo[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>("bundles")
  const enabled = isDemoMode()

  const firstBundleId = bundles[0]?.id ?? "a"

  const [localBundle, setLocalBundle] = useState<string>(() => {
    if (typeof window === "undefined") return firstBundleId
    const p = new URLSearchParams(window.location.search)
    const bp = p.get("bundle")
    return bp && getBundleByName(bundles, bp) ? bp : firstBundleId
  })

  const [localDims, setLocalDims] = useState<Record<DimensionName, Variant>>(() => {
    const p = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
    const bp = p.get("bundle")
    const bid = bp && getBundleByName(bundles, bp) ? bp : firstBundleId
    const defs = bundleDefaults(bundles, bid)
    for (const dim of DIMENSION_NAMES) {
      const ov = p.get(dim)
      if (ov === "A" || ov === "B") defs[dim] = ov
    }
    return defs
  })

  if (!enabled) return null

  function pushChanges(bundleId: string, dims: Record<DimensionName, Variant>) {
    const params = new URLSearchParams()
    const defs = bundleDefaults(bundles, bundleId)

    if (bundleId !== firstBundleId) {
      params.set("bundle", bundleId)
    }

    for (const dim of DIMENSION_NAMES) {
      if (dims[dim] !== defs[dim]) {
        params.set(dim, dims[dim])
      }
    }

    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  function selectBundle(bundleId: string) {
    const defs = bundleDefaults(bundles, bundleId)
    setLocalBundle(bundleId)
    setLocalDims(defs)
    pushChanges(bundleId, defs)
  }

  function toggleDim(dim: DimensionName) {
    const next = { ...localDims, [dim]: localDims[dim] === "A" ? "B" as Variant : "A" as Variant }
    setLocalDims(next)
    pushChanges(localBundle, next)
  }

  function reset() {
    const defs = bundleDefaults(bundles, firstBundleId)
    setLocalBundle(firstBundleId)
    setLocalDims(defs)
    router.replace(pathname, { scroll: false })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[100] rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-amber-700"
      >
        Demo Mode
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-96 rounded-lg border border-gray-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">
          {tab === "bundles" ? "Choose a Bundle" : DIMENSION_LABELS[tab]}
        </h3>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="border-b px-4 overflow-x-auto">
        <div className="flex gap-3 py-2 min-w-max">
          <button
            onClick={() => setTab("bundles")}
            className={`whitespace-nowrap border-b-2 px-1 py-1 text-xs font-medium capitalize ${
              tab === "bundles" ? "border-amber-600 text-amber-700" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Bundles
          </button>
          {DIMENSION_NAMES.map((dim) => (
            <button
              key={dim}
              onClick={() => setTab(dim)}
              className={`whitespace-nowrap border-b-2 px-1 py-1 text-xs font-medium capitalize ${
                tab === dim ? "border-amber-600 text-amber-700" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {DIMENSION_LABELS[dim]}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 max-h-80 overflow-y-auto">
        {tab === "bundles" ? (
          <div className="space-y-3">
            {bundles.map((bundle) => (
              <button
                key={bundle.id}
                onClick={() => selectBundle(bundle.id)}
                className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                  localBundle === bundle.id
                    ? "border-amber-600 bg-amber-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">{bundle.name}</span>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    Bundle {bundle.id}
                  </span>
                </div>
                {bundle.description && (
                  <p className="mt-1 text-xs text-gray-500">{bundle.description}</p>
                )}
                {localBundle === bundle.id && (
                  <div className="mt-2 flex gap-1.5">
                    {DIMENSION_NAMES.map((d) => (
                      <span
                        key={d}
                        className={`inline-block h-2 w-2 rounded-full ${
                          localDims[d] === "B" ? "bg-amber-500" : "bg-gray-300"
                        }`}
                        title={`${DIMENSION_LABELS[d]}: ${localDims[d]}`}
                      />
                    ))}
                  </div>
                )}
              </button>
            ))}
            <p className="pt-2 text-xs text-gray-400 text-center">
              Pick a bundle, then tweak individual dimensions
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <DimensionToggle
                label={DIMENSION_LABELS[tab]}
                description={DIMENSION_DESCRIPTIONS[tab]}
                variant={localDims[tab]}
                onToggle={() => toggleDim(tab)}
              />
            </div>

            <div className="border-t pt-3">
              <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                All Dimensions
              </p>
              <div className="space-y-2">
                {DIMENSION_NAMES.filter((d) => d !== tab).map((dim) => (
                  <DimensionToggle
                    key={dim}
                    label={DIMENSION_LABELS[dim]}
                    description={DIMENSION_DESCRIPTIONS[dim]}
                    variant={localDims[dim]}
                    onToggle={() => toggleDim(dim)}
                    compact
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between border-t px-4 py-3">
        <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-700">
          Reset
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded bg-amber-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
        >
          Apply
        </button>
      </div>
    </div>
  )
}

interface DimensionToggleProps {
  label: string
  description: string
  variant: Variant
  onToggle: () => void
  compact?: boolean
}

function DimensionToggle({ label, description, variant, onToggle, compact }: DimensionToggleProps) {
  return (
    <div className={`flex items-center justify-between ${compact ? "py-1" : "py-2"}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              variant === "B" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
            }`}
          >
            v{variant}
          </span>
        </div>
        {!compact && (
          <p className="mt-0.5 text-xs text-gray-400">{description}</p>
        )}
      </div>
      <button
        onClick={onToggle}
        className={`ml-3 relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          variant === "B" ? "bg-amber-600" : "bg-gray-200"
        }`}
        role="switch"
        aria-checked={variant === "B"}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            variant === "B" ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )
}
