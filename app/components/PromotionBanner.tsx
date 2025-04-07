"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { usePromotions, type Promotion } from "@/app/contexts/PromotionContext"

export function PromotionBanner() {
  const { getActivePromotions, isHomePage } = usePromotions()
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const checkAndShowPromotion = () => {
      const activePromotions = getActivePromotions()
      if (activePromotions.length > 0 && isHomePage()) {
        const hasSeenPromotion = localStorage.getItem("hasSeenPromotion")
        if (!hasSeenPromotion) {
          setCurrentPromotion(activePromotions[0])
          setShowBanner(true)
          localStorage.setItem("hasSeenPromotion", "true")

          // Clear the hasSeenPromotion flag when the user navigates away from the page
          const handleBeforeUnload = () => {
            localStorage.removeItem("hasSeenPromotion")
          }
          window.addEventListener("beforeunload", handleBeforeUnload)

          return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload)
          }
        }
      }
    }

    checkAndShowPromotion()
  }, [getActivePromotions, isHomePage])

  const handleDismiss = () => {
    setShowBanner(false)
  }

  if (!currentPromotion || !showBanner) return null

  const renderPromotion = () => {
    switch (currentPromotion.displayType) {
      case "POPUP":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
              {currentPromotion.imageUrl && (
                <div className="relative aspect-video">
                  <Image
                    src={currentPromotion.imageUrl || "/placeholder.svg"}
                    alt={currentPromotion.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{currentPromotion.title}</h3>
                <p className="text-gray-600 mb-4">{currentPromotion.description}</p>
                {currentPromotion.discountPercentage > 0 && (
                  <p className="text-xl font-bold text-red-600 mb-4">Save {currentPromotion.discountPercentage}%</p>
                )}
                <div className="flex justify-end gap-4">
                  {currentPromotion.dismissible && (
                    <Button variant="outline" onClick={handleDismiss}>
                      Close
                    </Button>
                  )}
                  <Button asChild>
                    <Link href="/shop">Shop Now</Link>
                  </Button>
                </div>
              </div>
              {currentPromotion.dismissible && (
                <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleDismiss}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        )

      case "HERO":
        return (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="relative bg-black text-white"
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-center gap-4">
                <p className="text-sm font-medium">
                  {currentPromotion.title} - Save {currentPromotion.discountPercentage}%
                </p>
                <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/10" asChild>
                  <Link href="/shop">Shop Now</Link>
                </Button>
              </div>
              {currentPromotion.dismissible && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-white/80"
                  onClick={handleDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        )

      case "SIDEBAR":
        return (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-50 max-w-sm"
          >
            <div className="bg-white rounded-l-lg shadow-xl p-6">
              <h3 className="text-xl font-bold mb-2">{currentPromotion.title}</h3>
              <p className="text-gray-600 mb-4">{currentPromotion.description}</p>
              {currentPromotion.discountPercentage > 0 && (
                <p className="text-lg font-bold text-red-600 mb-4">Save {currentPromotion.discountPercentage}%</p>
              )}
              <Button className="w-full" asChild>
                <Link href="/shop">Shop Now</Link>
              </Button>
              {currentPromotion.dismissible && (
                <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleDismiss}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return <AnimatePresence>{renderPromotion()}</AnimatePresence>
}

