"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"

interface WishlistItem {
  id: number
  name: string
  price: number
  imageUrl: string
  category: string
  gender: string
  rating?: number
}

interface WishlistContextType {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (itemId: number) => void
  isInWishlist: (itemId: number) => boolean
  clearWishlist: () => void
  itemCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Load wishlist from localStorage only on client side
  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist")
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist))
      } catch (e) {
        console.error("Error loading wishlist:", e)
        localStorage.removeItem("wishlist")
      }
    }
    setMounted(true)
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("wishlist", JSON.stringify(items))
    }
  }, [items, mounted])

  const addItem = (newItem: WishlistItem) => {
    setItems((currentItems) => {
      if (currentItems.some((item) => item.id === newItem.id)) {
        toast.error("Item already in wishlist")
        return currentItems
      }
      toast.success("Added to wishlist")
      return [...currentItems, newItem]
    })
  }

  const removeItem = (itemId: number) => {
    setItems((currentItems) => {
      const newItems = currentItems.filter((item) => item.id !== itemId)
      toast.success("Removed from wishlist")
      return newItems
    })
  }

  const isInWishlist = (itemId: number) => {
    return items.some((item) => item.id === itemId)
  }

  const clearWishlist = () => {
    setItems([])
    toast.success("Wishlist cleared")
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInWishlist,
        clearWishlist,
        itemCount: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}

