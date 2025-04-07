"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { toast } from "sonner"

interface CartItem {
  id: number
  name: string
  priceIDR: number // Store price in IDR
  imageUrl: string
  quantity: number
  category: string
  gender: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  updateQuantity: (itemId: number, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse saved cart:", error)
        toast.error("Failed to load saved cart. Starting with an empty cart.")
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(items))
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error)
      toast.error("Failed to save cart. Your changes may not persist after closing the browser.")
    }
  }, [items])

  const addItem = useCallback(async (newItem: Omit<CartItem, "quantity">) => {
    try {
      setItems((currentItems) => {
        const existingItem = currentItems.find((item) => item.id === newItem.id)

        if (existingItem) {
          toast.success("Updated cart quantity")
          return currentItems.map((item) => (item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item))
        }

        toast.success("Added to cart")
        return [...currentItems, { ...newItem, quantity: 1 }]
      })
    } catch (error) {
      console.error("Failed to add item to cart:", error)
      toast.error("Failed to add item to cart. Please try again.")
      throw error
    }
  }, [])

  const removeItem = useCallback(async (itemId: number) => {
    try {
      setItems((currentItems) => currentItems.filter((item) => item.id !== itemId))
      toast.success("Removed from cart")
    } catch (error) {
      console.error("Failed to remove item from cart:", error)
      toast.error("Failed to remove item from cart. Please try again.")
      throw error
    }
  }, [])

  const updateQuantity = useCallback(async (itemId: number, quantity: number) => {
    try {
      setItems((currentItems) =>
        currentItems
          .map((item) => (item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item))
          .filter((item) => item.quantity > 0),
      )
    } catch (error) {
      console.error("Failed to update item quantity:", error)
      toast.error("Failed to update item quantity. Please try again.")
      throw error
    }
  }, [])

  const clearCart = useCallback(async () => {
    try {
      setItems([])
      toast.success("Cart cleared")
    } catch (error) {
      console.error("Failed to clear cart:", error)
      toast.error("Failed to clear cart. Please try again.")
      throw error
    }
  }, [])

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

