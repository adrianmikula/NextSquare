"server-only"

"server-only"

import { requireEnv } from "@/lib/env"
import type { CmsAdapter, CmsProvider } from "@/types/cms"
import { OutstaticCmsAdapter } from "./adapters/outstatic"
import { WordPressCmsAdapter } from "./adapters/wordpress"

const provider = (process.env.CMS_PROVIDER ?? "outstatic") as CmsProvider

export function getCmsAdapter(): CmsAdapter {
  switch (provider) {
    case "wordpress": {
      const url = requireEnv("CMS_WORDPRESS_URL")
      const previewSecret = process.env.CMS_PREVIEW_SECRET
      return new WordPressCmsAdapter({
        url,
        previewSecret,
        previewUsername: process.env.CMS_WORDPRESS_USERNAME,
        previewPassword: process.env.CMS_WORDPRESS_PASSWORD,
      })
    }
    case "outstatic":
    default:
      return new OutstaticCmsAdapter()
  }
}

export function getCmsProvider(): CmsProvider {
  return provider
}
