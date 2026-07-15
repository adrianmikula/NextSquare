"use client"

import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import "soltana-ui/css"
import { SitePage } from "@/src/renderer/site-page"
import { generateStandaloneHtml } from "@/src/renderer/export"
import type { SiteConfig } from "@/src/schema/site-config"
import { DEFAULT_SITE_CONFIG } from "@/src/schema/site-config"

export default function PreviewPage() {
  const searchParams = useSearchParams()
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG)
  const [configs, setConfigs] = useState<
    { name: string; filename: string; meta: { name: string; industry: string } }[]
  >([])
  const [currentFile, setCurrentFile] = useState<string>("cafe.json")
  const [error, setError] = useState<string | null>(null)

  const loadConfig = useCallback(async (filename: string) => {
    setError(null)
    try {
      const res = await fetch(`/api/preview?config=${encodeURIComponent(filename)}`)
      if (!res.ok) {
        setError(`Failed to load config: ${res.statusText}`)
        return
      }
      const data = await res.json()
      setConfig(data)
      setCurrentFile(filename)
    } catch (e) {
      setError(`Error loading config: ${e instanceof Error ? e.message : String(e)}`)
    }
  }, [])

  useEffect(() => {
    const configParam = searchParams.get("config")
    const fileToLoad = configParam || "cafe.json"

    fetch(`/api/preview?config=${encodeURIComponent(fileToLoad)}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then((data) => {
        setConfig(data)
        setCurrentFile(fileToLoad)
      })
      .catch((e) => {
        setError(`Error loading config: ${e.message}`)
      })

    fetch("/api/preview")
      .then((res) => res.json())
      .then((data) => {
        if (data.configs) setConfigs(data.configs)
      })
      .catch(() => {})
  }, [searchParams])

  return (
    <div className="min-h-screen">
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: "rgba(0,0,0,0.85)",
          color: "white",
          padding: "0.5rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          fontSize: "0.875rem",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span style={{ fontWeight: 600, opacity: 0.7 }}>Preview</span>

        <select
          value={currentFile}
          onChange={(e) => {
            const newFile = e.target.value
            const url = new URL(window.location.href)
            url.searchParams.set("config", newFile)
            window.history.pushState({}, "", url.toString())
            loadConfig(newFile)
          }}
          style={{
            background: "rgba(255,255,255,0.1)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "4px",
            padding: "0.25rem 0.5rem",
            fontSize: "0.875rem",
          }}
        >
          {configs.map((c) => (
            <option key={c.filename} value={c.filename} style={{ color: "black" }}>
              {c.name} ({c.meta.industry})
            </option>
          ))}
        </select>

        <span style={{ opacity: 0.5 }}>
          {config.meta.name} &middot; {config.designLanguage.relief} /{" "}
          {config.designLanguage.finish} / {config.designLanguage.shape}
        </span>

        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {(["flat", "glassmorphic", "skeuomorphic", "neumorphic"] as const).map(
            (relief) => (
              <button
                key={relief}
                onClick={() => {
                  setConfig((prev) => ({
                    ...prev,
                    designLanguage: { ...prev.designLanguage, relief },
                  }))
                }}
                style={{
                  background:
                    config.designLanguage.relief === relief
                      ? "rgba(255,255,255,0.25)"
                      : "rgba(255,255,255,0.08)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "4px",
                  padding: "0.2rem 0.5rem",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                {relief}
              </button>
            ),
          )}
          <button
            onClick={() => {
              const html = generateStandaloneHtml(config)
              const blob = new Blob([html], { type: "text/html" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `${config.meta.name.replace(/\s+/g, "-").toLowerCase()}.html`
              a.click()
              URL.revokeObjectURL(url)
            }}
            style={{
              background: "rgba(34,197,94,0.3)",
              color: "white",
              border: "1px solid rgba(34,197,94,0.4)",
              borderRadius: "4px",
              padding: "0.2rem 0.5rem",
              fontSize: "0.75rem",
              cursor: "pointer",
              marginLeft: "0.5rem",
            }}
          >
            Download HTML
          </button>
        </div>
      </div>

      <div style={{ paddingTop: "2.5rem" }}>
        {error ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "#ef4444",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {error}
          </div>
        ) : (
          <SitePage config={config} />
        )}
      </div>
    </div>
  )
}
