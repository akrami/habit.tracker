"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface SidebarContextType {
  isMinified: boolean
  setIsMinified: (minified: boolean) => void
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isMinified, setIsMinified] = useState(true) // Default to minified
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <SidebarContext.Provider value={{
      isMinified,
      setIsMinified,
      isSidebarOpen,
      setIsSidebarOpen
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}