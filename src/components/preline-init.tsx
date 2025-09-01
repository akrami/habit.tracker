"use client"

import { useEffect } from 'react'

declare global {
  interface Window {
    HSStaticMethods: {
      autoInit(): void
    }
  }
}

export default function PrelineInit() {
  useEffect(() => {
    const loadPreline = async () => {
      await import('preline/preline')
      
      if (window.HSStaticMethods) {
        window.HSStaticMethods.autoInit()
      }
    }
    
    loadPreline()
  }, [])

  return null
}