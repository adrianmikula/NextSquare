"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingBag, ClipboardList, Settings, LogOut } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/menu", label: "Menu", icon: ShoppingBag },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  return (
    <aside className="flex w-64 flex-col border-card bg-card" style={{ borderRightWidth: "var(--theme-border-width)" }}>
      <div className="flex h-16 items-center gap-2 border-card px-6" style={{ borderBottomWidth: "var(--theme-border-width)" }}>
        <span className="text-lg font-bold text-heading">☕ Cafe Admin</span>
      </div>

      <ul className="menu flex-nowrap p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={isActive ? "active" : ""}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>

      <ul className="menu flex-nowrap border-card p-4" style={{ borderTopWidth: "var(--theme-border-width)" }}>
        <li>
          <button onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </li>
      </ul>
    </aside>
  )
}
