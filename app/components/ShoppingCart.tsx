"use client"

import { useState, useCallback, useMemo } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingBag, Minus, Plus, Trash2, Loader2 } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/app/contexts/CartContext"
import { useCurrency } from "@/app/contexts/CurrencyContext"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { settingsService } from "@/app/services/settingsService" // Import settings service

export function ShoppingCart() {
  const [isOpen, setIsOpen] = useState(false)
  const { items, removeItem, updateQuantity, itemCount, clearCart } = useCart()
  const { convertPrice, formatPrice, currency } = useCurrency()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const total = useMemo(
    () => items.reduce((sum, item) => sum + convertPrice(item.priceIDR) * item.quantity, 0),
    [items, convertPrice],
  )

  const handleCheckout = useCallback(async () => {
    setIsCheckingOut(true)
    try {
      const settings = settingsService.getSettings()

      if (!settings.whatsappLink) {
        throw new Error("WhatsApp contact not configured")
      }

      if (!settingsService.isBusinessOpen()) {
        throw new Error("Store is currently closed. Please try again during business hours.")
      }

      const message = settingsService.formatWhatsAppMessage(
        items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: convertPrice(item.priceIDR),
        })),
        total,
      )

      const whatsappUrl = `${settings.whatsappLink}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")

      clearCart()
      setIsOpen(false)
      toast.success("Order placed successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to place order")
    } finally {
      setIsCheckingOut(false)
    }
  }, [items, convertPrice, total, clearCart])

  const cartItemAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingBag className="h-5 w-5" />
          <AnimatePresence>
            {itemCount > 0 && (
              <motion.span
                key="cart-count"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >
                {itemCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1 -mx-6 px-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm text-muted-foreground">Add some products to your cart</p>
              </div>
            ) : (
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div key={item.id} {...cartItemAnimation} className="py-4 flex gap-4 border-b last:border-b-0">
                    <Image
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{formatPrice(convertPrice(item.priceIDR))}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="ml-auto" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm font-medium mt-2">
                        Subtotal: {formatPrice(convertPrice(item.priceIDR) * item.quantity)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </ScrollArea>
          {items.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <Button className="w-full" onClick={handleCheckout} disabled={isCheckingOut}>
                {isCheckingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Checkout via WhatsApp"
                )}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

