"use client"

import { useState, useSyncExternalStore } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isDemoMode } from "@/lib/demo/config"
import { parseDemoState } from "@/lib/demo/demo-state"
import { X } from "lucide-react"

type Axis = "A" | "B" | null
type Tab = "layout" | "text" | "theme"

function getSearch(): string {
  if (typeof window === "undefined") return ""
  return window.location.search
}

function createSubscribe() {
  let origPushState: typeof history.pushState
  let origReplaceState: typeof history.replaceState

  return function subscribe(cb: () => void) {
    window.addEventListener("popstate", cb)
    origPushState = history.pushState
    origReplaceState = history.replaceState
    history.pushState = function (this: History, ...args: unknown[]) {
      origPushState.call(this, ...args)
      queueMicrotask(cb)
    }
    history.replaceState = function (this: History, ...args: unknown[]) {
      origReplaceState.call(this, ...args)
      queueMicrotask(cb)
    }
    return () => {
      window.removeEventListener("popstate", cb)
      history.pushState = origPushState
      history.replaceState = origReplaceState
    }
  }
}

const getSubscribe = createSubscribe()

export function DemoModePopup() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>("layout")
  const enabled = isDemoMode()

  const search = useSyncExternalStore(getSubscribe, getSearch, getSearch)
  const searchParams = new URLSearchParams(search)

  const initial = parseDemoState(searchParams)
  const [state, setState] = useState<{ layout: Axis; text: Axis; theme: Axis }>({
    layout: initial.layout ?? null,
    text: initial.text ?? null,
    theme: initial.theme ?? null,
  })
  const derived = parseDemoState(searchParams)
  const resolved = derived.layout ?? state.layout
  const resolvedText = derived.text ?? state.text
  const resolvedTheme = derived.theme ?? state.theme

  if (!enabled) return null

  function updateAxis(axis: "layout" | "text" | "theme", value: Axis) {
    const next = { ...state, [axis]: value }
    setState(next)
    const params = new URLSearchParams()
    if (next.theme) params.set("theme", next.theme)
    if (next.layout) params.set("layout", next.layout)
    if (next.text) params.set("text", next.text)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
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
    <div className="fixed bottom-4 right-4 z-[100] w-80 rounded-lg border border-gray-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Demo Mode</h3>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="border-b px-4">
        <div className="flex gap-4">
          {(["layout", "text", "theme"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 px-1 py-2 text-xs font-medium capitalize ${
                tab === t ? "border-amber-600 text-amber-700" : "border-transparent text-gray-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {tab === "layout" && (
          <div className="space-y-2">
            <RadioOption label="Feature-forward" value="A" current={resolved} onChange={(v) => updateAxis("layout", v)} />
            <RadioOption label="Conservative" value="B" current={resolved} onChange={(v) => updateAxis("layout", v)} />
          </div>
        )}
        {tab === "text" && (
          <div className="space-y-2">
            <RadioOption label="Wording A" value="A" current={resolvedText} onChange={(v) => updateAxis("text", v)} />
            <RadioOption label="Wording B" value="B" current={resolvedText} onChange={(v) => updateAxis("text", v)} />
          </div>
        )}
        {tab === "theme" && (
          <div className="space-y-2">
            <RadioOption label="Amber" value="A" current={resolvedTheme} onChange={(v) => updateAxis("theme", v)} />
            <RadioOption label="Green" value="B" current={resolvedTheme} onChange={(v) => updateAxis("theme", v)} />
          </div>
        )}
      </div>

      <div className="flex justify-between border-t px-4 py-3">
        <button
          onClick={() => {
            setState({ layout: null, text: null, theme: null })
            router.replace(pathname, { scroll: false })
          }}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
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

interface RadioOptionProps {
  label: string
  value: Axis
  current: Axis
  onChange: (v: Axis) => void
}

function RadioOption({ label, value, current, onChange }: RadioOptionProps) {
  const checked = current === value
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
      <input
        type="radio"
        name={`demo-${label}`}
        checked={checked}
        onChange={() => onChange(value)}
        className="h-4 w-4 border-gray-300 text-amber-600 focus:ring-amber-500"
      />
      {label}
    </label>
  )
}
