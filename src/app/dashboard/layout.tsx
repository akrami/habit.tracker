"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Sidebar from "@/components/layout/sidebar"
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isMinified, setIsMinified } = useSidebar()
  
  return (
    <>
      <Sidebar />
      <main className="lg:ml-16 pt-4">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
        
        {/* Desktop Overlay when sidebar is expanded */}
        {!isMinified && (
          <div
            className="hidden lg:block fixed inset-0 bg-black bg-opacity-50 z-[55]"
            onClick={() => setIsMinified(true)}
          />
        )}
      </main>
    </>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/auth/signin")
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  )
}