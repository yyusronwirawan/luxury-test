"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
}

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  //const pathname = usePathname()
  //const searchParams = useSearchParams()

  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => {
      // Add a slight delay to ensure smooth transitions
      setTimeout(() => setIsLoading(false), 500)
    }

    handleStart()
    const timer = setTimeout(handleComplete, Math.random() * 1000 + 1000) // Simulate loading time

    return () => clearTimeout(timer)
  }, []) //Removed pathname and searchParams

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  return <LoadingContext.Provider value={{ isLoading, setLoading }}>{children}</LoadingContext.Provider>
}

