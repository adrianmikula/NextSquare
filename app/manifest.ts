import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cafe Template",
    short_name: "Cafe",
    description: "Fresh coffee, great food, and a warm atmosphere.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#d97706",
  }
}
