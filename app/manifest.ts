import type { MetadataRoute } from "next"
import { listTenants, readSiteProfile } from "@/lib/cms"

export default function manifest(): MetadataRoute.Manifest {
  const tenants = listTenants()
  const tenant = tenants[0] || "aydins-cafe"
  const profile = readSiteProfile(tenant)

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
