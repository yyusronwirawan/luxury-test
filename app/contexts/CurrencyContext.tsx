"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "sonner"

type Currency = "IDR" | "USD" | "THB"

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  convertPrice: (priceInIDR: number) => number
  formatPrice: (price: number | undefined) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}

const DEFAULT_RATES = {
  USD: 1 / 15500, // 1 USD = 15500 IDR
  THB: 1 / 450, // 1 THB = 450 IDR
}

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>("IDR")
  const [exchangeRates, setExchangeRates] = useState(DEFAULT_RATES)

  // Load saved currency preference and exchange rates
  useEffect(() => {
    if (typeof window === "undefined") return

    const savedCurrency = localStorage.getItem("currency") as Currency
    if (savedCurrency) {
      setCurrency(savedCurrency)
    }

    // Load exchange rates
    const loadExchangeRates = () => {
      const savedRates = localStorage.getItem("exchangeRates")
      if (savedRates) {
        try {
          const rates = JSON.parse(savedRates)
          setExchangeRates({
            USD: rates.USD || DEFAULT_RATES.USD,
            THB: rates.THB || DEFAULT_RATES.THB,
          })
        } catch (error) {
          console.error("Error parsing exchange rates:", error)
          setExchangeRates(DEFAULT_RATES)
        }
      }
    }

    loadExchangeRates()

    // Check for scheduled rate changes
    const checkScheduledChanges = () => {
      const scheduledChange = localStorage.getItem("scheduledRateChange")
      if (scheduledChange) {
        try {
          const { date, USD, THB } = JSON.parse(scheduledChange)
          if (new Date(date) <= new Date()) {
            const newRates = {
              USD: 1 / Number(USD),
              THB: 1 / Number(THB),
            }
            setExchangeRates(newRates)
            localStorage.setItem("exchangeRates", JSON.stringify(newRates))
            localStorage.removeItem("scheduledRateChange")
          }
        } catch (error) {
          console.error("Error checking scheduled rates:", error)
        }
      }
    }

    checkScheduledChanges()

    // Listen for storage events to update rates in real-time across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "exchangeRates" && e.newValue) {
        try {
          const newRates = JSON.parse(e.newValue)
          setExchangeRates(newRates)
        } catch (error) {
          console.error("Error parsing updated exchange rates:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    const interval = setInterval(checkScheduledChanges, 60000) // Check every minute

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // Save currency preference when it changes
  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem("currency", currency)
  }, [currency])

  const convertPrice = (priceInIDR: number): number => {
    if (!priceInIDR || isNaN(priceInIDR)) return 0

    try {
      switch (currency) {
        case "USD":
          return +(priceInIDR * exchangeRates.USD).toFixed(2)
        case "THB":
          return +(priceInIDR * exchangeRates.THB).toFixed(2)
        default:
          return +priceInIDR.toFixed(2)
      }
    } catch (error) {
      console.error("Error converting price:", error)
      return 0
    }
  }

  const formatPrice = (price: number | undefined): string => {
    if (price === undefined || price === null || isNaN(price)) {
      return currency === "USD" ? "$0.00" : currency === "THB" ? "฿0.00" : "Rp 0"
    }

    try {
      switch (currency) {
        case "USD":
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(price)

        case "THB":
          return new Intl.NumberFormat("th-TH", {
            style: "currency",
            currency: "THB",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(price)

        default: // IDR
          return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(price)
      }
    } catch (error) {
      console.error("Error formatting price:", error)
      return currency === "USD" ? "$0.00" : currency === "THB" ? "฿0.00" : "Rp 0"
    }
  }

  const value = {
    currency,
    setCurrency,
    convertPrice,
    formatPrice,
  }

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

