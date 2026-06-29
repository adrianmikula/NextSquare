import { redirect } from "next/navigation"
import { getActiveTenant } from "@/lib/cms"

export const dynamic = "force-dynamic"

export default function RootPage() {
  const tenant = getActiveTenant()
  redirect(`/${tenant}`)
}