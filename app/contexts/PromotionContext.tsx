"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"

export interface Promotion {
  id: number
  title: string
  description: string
  imageUrl: string
  startDate: string
  endDate: string
  discountPercentage: number
  type: "BANNER" | "SALE" | "SPECIAL_OFFER"
  status: "ACTIVE" | "SCHEDULED" | "EXPIRED"
  targetGender?: "MAN" | "WOMAN" | "ALL"
  targetCategory?: string
  conditions?: string
  priority: number
  displayType?: "POPUP" | "HERO" | "SIDEBAR"
  displayDuration?: number
  dismissible?: boolean
}

interface PromotionContextType {
  promotions: Promotion[]
  addPromotion: (promotion: Omit<Promotion, "id" | "createdAt" | "updatedAt">) => void
  updatePromotion: (id: number, promotion: Partial<Promotion>) => void
  deletePromotion: (id: number) => void
  getActivePromotions: () => Promotion[]
  reorderPromotions: (newOrder: number[]) => void
  isHomePage: () => boolean
}

const PromotionContext = createContext<PromotionContextType | undefined>(undefined)

const STORAGE_KEY = "promotions"

export function PromotionProvider({ children }: { children: React.ReactNode }) {
  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(promotions))
  }, [promotions])

  const addPromotion = (newPromotion: Omit<Promotion, "id" | "createdAt" | "updatedAt">) => {
    setPromotions((current) => {
      const maxId = Math.max(...current.map((p) => p.id), 0)
      const now = new Date().toISOString()
      return [
        ...current,
        {
          ...newPromotion,
          id: maxId + 1,
          createdAt: now,
          updatedAt: now,
        },
      ]
    })
    toast.success("Promotion added successfully")
  }

  const updatePromotion = (id: number, updates: Partial<Promotion>) => {
    setPromotions((current) =>
      current.map((promotion) =>
        promotion.id === id ? { ...promotion, ...updates, updatedAt: new Date().toISOString() } : promotion,
      ),
    )
    toast.success("Promotion updated successfully")
  }

  const deletePromotion = (id: number) => {
    setPromotions((current) => current.filter((promotion) => promotion.id !== id))
    toast.success("Promotion deleted successfully")
  }

  const getActivePromotions = () => {
    const now = new Date()
    return promotions
      .filter((promo) => {
        const startDate = new Date(promo.startDate)
        const endDate = new Date(promo.endDate)
        return startDate <= now && endDate >= now && promo.status === "ACTIVE"
      })
      .sort((a, b) => a.priority - b.priority)
  }

  const reorderPromotions = (newOrder: number[]) => {
    const reorderedPromotions = newOrder.map((id) => promotions.find((p) => p.id === id)!).filter(Boolean)
    setPromotions(reorderedPromotions)
    toast.success("Promotions reordered successfully")
  }

  const isHomePage = () => {
    return typeof window !== "undefined" && window.location.pathname === "/"
  }

  return (
    <PromotionContext.Provider
      value={{
        promotions,
        addPromotion,
        updatePromotion,
        deletePromotion,
        getActivePromotions,
        reorderPromotions,
        isHomePage,
      }}
    >
      {children}
    </PromotionContext.Provider>
  )
}

export function usePromotions() {
  const context = useContext(PromotionContext)
  if (context === undefined) {
    throw new Error("usePromotions must be used within a PromotionProvider")
  }
  return context
}

