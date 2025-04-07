"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, Tag, ImageIcon, Star, LogOut, DollarSign, Settings, Key } from "lucide-react"
import { useAuth } from "@/app/contexts/AuthContext"

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Promotions",
    href: "/admin/promotions",
    icon: Tag,
  },
  {
    title: "Best Sellers",
    href: "/admin/bestsellers",
    icon: Star,
  },
  {
    title: "Media Library",
    href: "/admin/media",
    icon: ImageIcon,
  },
  {
    title: "Currency Settings",
    href: "/admin/currency-settings",
    icon: DollarSign,
  },
  {
    title: "Site Settings",
    href: "/admin/site-settings",
    icon: Settings,
  },
  {
    title: "Password Management",
    href: "/admin/password-management",
    icon: Key,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <div className="w-64 h-full bg-white border-r">
      <div className="p-6">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="space-y-1 px-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            )}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.title}
          </Link>
        ))}
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </nav>
    </div>
  )
}

