import { NextRequest, NextResponse } from "next/server"
import { readFileSync, readdirSync, existsSync } from "fs"
import { join } from "path"
import type { SiteConfig } from "@/src/schema/site-config"

const TEST_CONFIGS_DIR = join(process.cwd(), "src", "test-configs")

interface ConfigEntry {
  name: string
  filename: string
  meta: SiteConfig["meta"]
  designLanguage: SiteConfig["designLanguage"]
}

function getConfigFilenames(): string[] {
  if (!existsSync(TEST_CONFIGS_DIR)) return []
  return readdirSync(TEST_CONFIGS_DIR).filter((f) => f.endsWith(".json"))
}

function readConfig(filename: string): SiteConfig | null {
  const filePath = join(TEST_CONFIGS_DIR, filename)
  if (!existsSync(filePath)) return null
  try {
    const raw = readFileSync(filePath, "utf-8")
    return JSON.parse(raw) as SiteConfig
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const configParam = searchParams.get("config")

  if (configParam) {
    const config = readConfig(configParam)
    if (!config) {
      return NextResponse.json(
        { error: `Config not found: ${configParam}` },
        { status: 404 },
      )
    }
    return NextResponse.json(config)
  }

  const filenames = getConfigFilenames()
  const entries: ConfigEntry[] = filenames
    .map((f) => {
      const config = readConfig(f)
      if (!config) return null
      return {
        name: f.replace(/\.json$/, ""),
        filename: f,
        meta: config.meta,
        designLanguage: config.designLanguage,
      }
    })
    .filter((e): e is ConfigEntry => e !== null)

  return NextResponse.json({ configs: entries })
}

export async function POST(request: NextRequest) {
  try {
    const config: SiteConfig = await request.json()

    if (!config.spec || !config.designLanguage) {
      return NextResponse.json(
        { error: "Invalid SiteConfig: missing spec or designLanguage" },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: true, config })
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    )
  }
}
