"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    HSStaticMethods: {
      autoInit(): void
    }
  }
}

export default function PrelineInit() {
  const pathname = usePathname()

  useEffect(() => {
    const loadPreline = async () => {
      try {
        // Only load the main preline library
        await import('preline/preline')
        
        if (window.HSStaticMethods) {
          window.HSStaticMethods.autoInit()
        }
      } catch (error) {
        console.log('Preline failed to load, using fallback functionality')
      }
    }
    
    loadPreline()
  }, [pathname])

  return null
}