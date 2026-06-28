import { redirect } from "next/navigation"
import { listTenants } from "@/lib/cms"

export const dynamic = "force-dynamic"

export default function RootPage() {
  const tenants = listTenants()
  const defaultTenant = tenants[0] || "aydins-cafe"
  redirect(`/${defaultTenant}`)
}
