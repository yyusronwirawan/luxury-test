"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Package,
  Tag,
  ImageIcon,
  Star,
  DollarSign,
  Settings,
  PlusCircle,
  FileImage,
  Percent,
  BarChart2,
} from "lucide-react"
import Link from "next/link"

export function QuickAccess() {
  const actions = [
    {
      title: "Add New Product",
      icon: PlusCircle,
      href: "/admin/products",
      color: "text-green-500",
    },
    {
      title: "Upload Media",
      icon: FileImage,
      href: "/admin/media",
      color: "text-blue-500",
    },
    {
      title: "Create Promotion",
      icon: Percent,
      href: "/admin/promotions",
      color: "text-purple-500",
    },
    {
      title: "View Analytics",
      icon: BarChart2,
      href: "/admin",
      color: "text-orange-500",
    },
  ]

  const sections = [
    {
      title: "Products",
      icon: Package,
      href: "/admin/products",
      description: "Manage your product catalog",
    },
    {
      title: "Promotions",
      icon: Tag,
      href: "/admin/promotions",
      description: "Create and manage promotions",
    },
    {
      title: "Media Library",
      icon: ImageIcon,
      href: "/admin/media",
      description: "Upload and manage media files",
    },
    {
      title: "Best Sellers",
      icon: Star,
      href: "/admin/bestsellers",
      description: "Manage featured products",
    },
    {
      title: "Currency Settings",
      icon: DollarSign,
      href: "/admin/currency-settings",
      description: "Configure exchange rates",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/admin/settings",
      description: "System configuration",
    },
  ]

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action) => (
              <Button
                key={action.title}
                variant="outline"
                className="h-auto flex flex-col items-center gap-2 p-4"
                asChild
              >
                <Link href={action.href}>
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                  <span>{action.title}</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card key={section.title} className="hover:shadow-lg transition-shadow">
            <Link href={section.href}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <section.icon className="h-5 w-5" />
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}

