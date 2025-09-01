"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "🏠" },
  { name: "My Habits", href: "/dashboard/habits", icon: "✅" },
  { name: "Analytics", href: "/dashboard/analytics", icon: "📊" },
  { name: "Categories", href: "/dashboard/categories", icon: "🏷️" },
  { name: "Goals", href: "/dashboard/goals", icon: "🎯" },
  { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center p-3 text-gray-800 rounded-lg hover:bg-gray-100 group transition-all duration-200 dark:text-gray-200 dark:hover:bg-gray-700",
                      isActive && "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-800/20 dark:text-blue-400 dark:border-blue-800/30"
                    )}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span className="flex-1 whitespace-nowrap font-medium">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}