"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/contexts/sidebar-context"
import { useSession, signOut } from "next-auth/react"

const navigation = [
  { 
    name: "Dashboard", 
    href: "/dashboard", 
    icon: (
      <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ) 
  },
  { 
    name: "My Habits", 
    href: "/dashboard/habits", 
    icon: (
      <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4"/>
        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.26 0 2.44.26 3.52.73"/>
      </svg>
    ) 
  },
  { 
    name: "Analytics", 
    href: "/dashboard/analytics", 
    icon: (
      <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/>
        <path d="m19 9-5 5-4-4-3 3"/>
      </svg>
    ) 
  },
  { 
    name: "Categories", 
    href: "/dashboard/categories", 
    icon: (
      <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 7h.01"/>
        <path d="M17 7h.01"/>
        <rect width="18" height="18" x="3" y="3" rx="2"/>
        <path d="M9 9h1v1H9z"/>
        <path d="M14 9h1v1h-1z"/>
      </svg>
    ) 
  },
  { 
    name: "Settings", 
    href: "/dashboard/settings", 
    icon: (
      <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ) 
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isMinified, setIsMinified, isSidebarOpen, setIsSidebarOpen } = useSidebar()
  const { data: session } = useSession()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Close mobile sidebar and minimize desktop sidebar when pathname changes (navigation)
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname, setIsSidebarOpen])

  // Separate effect to minimize sidebar only when navigating from full width mode
  const [lastPathname, setLastPathname] = useState(pathname)
  
  useEffect(() => {
    // Only minimize if pathname actually changed (navigation occurred) and sidebar was in full mode
    if (pathname !== lastPathname && !isMinified) {
      setIsMinified(true)
    }
    setLastPathname(pathname)
  }, [pathname, lastPathname, isMinified, setIsMinified])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  const toggleMinified = () => {
    setIsMinified(!isMinified)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  // Close dropdown when clicking outside or on mobile sidebar close
  useEffect(() => {
    setIsDropdownOpen(false)
  }, [pathname, isSidebarOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isDropdownOpen && !target.closest('[data-dropdown="user-account"]')) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  return (
    <>
      {/* Mobile Navigation Toggle */}
      <div className="lg:hidden py-16 text-center">
        <button 
          type="button" 
          onClick={toggleSidebar}
          className="py-2 px-3 inline-flex justify-center items-center gap-x-2 text-start bg-gray-800 border border-gray-800 text-white text-sm font-medium rounded-lg shadow-2xs align-middle hover:bg-gray-950 focus:outline-hidden focus:bg-gray-900 dark:bg-white dark:text-neutral-800 dark:hover:bg-neutral-200 dark:focus:bg-neutral-200" 
          aria-haspopup="dialog" 
          aria-expanded={isSidebarOpen} 
          aria-controls="hs-sidebar-overlay" 
          aria-label="Toggle navigation" 
          data-hs-overlay="#hs-sidebar-overlay"
        >
          Open
        </button>
      </div>
      {/* End Mobile Navigation Toggle */}


      {/* Sidebar */}
      <div 
        id="hs-sidebar-overlay" 
        className={cn(
          "transition-all duration-300 transform h-full overflow-x-hidden fixed top-0 start-0 bottom-0 z-[60] bg-white border-e border-gray-200 dark:bg-neutral-800 dark:border-neutral-700",
          // Desktop: always visible but width changes based on minified state
          "lg:block lg:translate-x-0",
          isMinified ? "lg:w-16" : "lg:w-64",
          // Mobile: hidden by default, show when opened  
          isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 hidden lg:block"
        )}
        role="dialog" 
        tabIndex={-1} 
        aria-label="Sidebar"
      >
        <div className="relative flex flex-col h-full max-h-full">
          {/* Header */}
          <header className={cn(
            "py-4 px-2 flex items-center gap-x-2",
            isMinified ? "justify-center" : "justify-between"
          )}>
            <Link className={cn("flex-none font-semibold text-xl text-black focus:outline-hidden focus:opacity-80 dark:text-white", isMinified && "lg:hidden")} href="/dashboard" aria-label="Brand">
              Habit Tracker
            </Link>

            <div className="lg:hidden">
              {/* Close Button */}
              <button 
                type="button" 
                onClick={closeSidebar}
                className="flex justify-center items-center gap-x-3 size-6 bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 dark:hover:text-neutral-200 dark:focus:text-neutral-200" 
                data-hs-overlay="#hs-sidebar-overlay"
              >
                <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                <span className="sr-only">Close</span>
              </button>
              {/* End Close Button */}
            </div>
            <div className="hidden lg:block">
              {/* Toggle Button */}
              <button 
                type="button" 
                onClick={toggleMinified}
                className={cn(
                  "flex justify-center items-center flex-none text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 dark:hover:text-neutral-200 dark:focus:text-neutral-200",
                  // Mini mode: square button like navigation items
                  isMinified ? "w-10 h-10 rounded-lg" : "gap-x-3 size-9 rounded-full"
                )}
                aria-haspopup="dialog" 
                aria-expanded="false" 
                aria-controls="hs-sidebar-overlay" 
                aria-label="Minify navigation" 
                data-hs-overlay-minifier="#hs-sidebar-overlay"
              >
                {isMinified ? (
                  <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="m8 9 3 3-3 3"/></svg>
                ) : (
                  <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="m10 15-3-3 3-3"/></svg>
                )}
                <span className="sr-only">Navigation Toggle</span>
              </button>
              {/* End Toggle Button */}
            </div>
          </header>
          {/* End Header */}

          {/* Body */}
          <nav className="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            <div className="pb-0 px-2 w-full flex flex-col flex-wrap">
              <ul className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={closeSidebar}
                        className={cn(
                          "min-h-[36px] flex items-center text-sm text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 dark:text-neutral-200",
                          isActive && "bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-white",
                          // Mini mode: square centered button
                          isMinified ? "lg:justify-center lg:w-10 lg:h-10 lg:mx-auto lg:p-0" : "gap-x-3.5 py-2 px-2.5"
                        )}
                      >
                        {item.icon}
                        <span className={cn(isMinified && "lg:hidden")}>{item.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </nav>
          {/* End Body */}

          {/* Footer */}
          <footer className="mt-auto p-2 border-t border-gray-200 dark:border-neutral-700">
            {/* Account Dropdown */}
            <div className="relative w-full inline-flex" data-dropdown="user-account">
              <button 
                type="button" 
                onClick={toggleDropdown}
                className={cn(
                  "inline-flex shrink-0 items-center text-start text-sm text-gray-800 rounded-md hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700",
                  // Mini mode: square centered button with only avatar
                  isMinified ? "w-10 h-10 justify-center mx-auto p-0" : "w-full gap-x-2 p-2"
                )}
                aria-haspopup="menu" 
                aria-expanded={isDropdownOpen} 
                aria-label="Account menu"
              >
                <img 
                  className="shrink-0 size-5 rounded-full" 
                  src={session?.user?.image || "https://images.unsplash.com/photo-1734122415415-88cb1d7d5dc0?q=80&w=320&h=320&auto=format&fit=facearea&facepad=3&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"} 
                  alt="Avatar"
                />
                {!isMinified && (
                  <>
                    <span className="truncate">{session?.user?.name || "User"}</span>
                    <svg className="shrink-0 size-3.5 ms-auto" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>
                    </svg>
                  </>
                )}
              </button>

              {/* End Account Dropdown */}
            </div>
            {/* End Account Dropdown */}
          </footer>
          {/* End Footer */}
        </div>
      </div>
      {/* End Sidebar */}

      {/* Account Dropdown - Outside sidebar for proper positioning */}
      {isDropdownOpen && (
        <div 
          className={cn(
            "fixed w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-[70] dark:bg-neutral-900 dark:border-neutral-700",
            // Position based on sidebar mode
            isMinified 
              ? "bottom-4 left-20" // Mini mode: positioned to the right of mini sidebar
              : "bottom-20 left-4"  // Full mode: positioned within full sidebar
          )} 
          role="menu"
        >
          <div className="p-1">
            <Link 
              href="/dashboard/settings" 
              className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
              onClick={() => setIsDropdownOpen(false)}
            >
              <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Settings
            </Link>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
            >
              <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" x2="9" y1="12" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
      {/* End Account Dropdown */}

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      {/* End Mobile Overlay */}
    </>
  )
}