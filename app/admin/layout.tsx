"use client"

import { useAuth } from "../contexts/AuthContext"
import { Sidebar } from "./components/Sidebar"
import { Loader2 } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Toaster } from "sonner"
import type React from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const pathname = usePathname()

  // If on login page, don't show sidebar
  if (pathname === "/admin/login") {
    return (
      <>
        {children}
        <Toaster position="top-center" />
      </>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto mb-4" />
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show nothing (redirect will happen in AuthContext)
  if (!isAuthenticated) {
    return null
  }

  // Render admin layout with sidebar for authenticated users
  return (
    <div className="min-h-screen h-screen bg-gray-100">
      <div className="flex h-full">
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto">
          {user && <div className="mb-4 text-sm text-gray-500">Logged in as: {user.username}</div>}
          {children}
        </main>
      </div>
      <Toaster position="top-center" />
    </div>
  )
}

