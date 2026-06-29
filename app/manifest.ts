import type { MetadataRoute } from "next"
import { readSiteProfile } from "@/lib/cms"

export default function manifest(): MetadataRoute.Manifest {
  const profile = readSiteProfile()

  return {
    name: profile?.siteName || "Cafe Template",
    short_name: profile?.siteName?.split(" ")[0] || "Cafe",
    description: profile?.description || "Fresh coffee, great food, and a warm atmosphere.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#d97706",
  }
}
