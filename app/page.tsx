"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  ArrowRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Instagram,
  MessageCircle,
  Phone,
} from "lucide-react"
import { CategorySection } from "./components/CategorySection"
import { useProducts } from "./contexts/ProductContext"
import { cn } from "@/lib/utils"
import { useCurrency } from "./contexts/CurrencyContext"
import { motion, AnimatePresence } from "framer-motion"
import { ProductCardSkeleton } from "./components/ProductCardSkeleton"
import { useSettings } from "./hooks/useSettings" // Import useSettings instead of settingsService

export default function Home() {
  const { getBestSellers, getSaleProducts } = useProducts()
  const { convertPrice, formatPrice, currency } = useCurrency()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const settings = useSettings() // Use useSettings hook

  const bestSellers = useMemo(() => getBestSellers().slice(0, 4), [getBestSellers])
  const hotDeals = useMemo(() => getSaleProducts().slice(0, 2), [getSaleProducts])

  const bestSellersRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScrollButtons = () => {
    if (bestSellersRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = bestSellersRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10) // 10px buffer
    }
  }

  // Add wheel event handler for horizontal scrolling
  const handleWheel = (event: WheelEvent) => {
    if (bestSellersRef.current) {
      event.preventDefault()
      bestSellersRef.current.scrollLeft += event.deltaY
      checkScrollButtons()
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("An error occurred while loading the data. Please try again later.")
        setIsLoading(false)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const element = bestSellersRef.current
    if (element) {
      element.addEventListener("wheel", handleWheel, { passive: false })
      checkScrollButtons()
    }
    window.addEventListener("resize", checkScrollButtons)

    return () => {
      if (element) {
        element.removeEventListener("wheel", handleWheel)
      }
      window.removeEventListener("resize", checkScrollButtons)
    }
  }, [checkScrollButtons]) // Removed handleWheel from dependencies

  const scroll = (direction: "left" | "right") => {
    if (bestSellersRef.current) {
      const scrollAmount = 300 // Adjust scroll amount as needed
      bestSellersRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-16">
        {/* Hero Section Skeleton */}
        <div className="h-screen bg-gray-200 animate-pulse" />

        {/* Best Sellers Section Skeleton */}
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-screen">
        <Image src="/hero-image.jpg" alt="Luxury Fashion" layout="fill" objectFit="cover" quality={100} priority />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-center">{settings.heroTitle}</h1>
          <p className="text-xl md:text-2xl mb-8 text-center">{settings.heroSubtitle}</p>
          <Button asChild size="lg" className="bg-gold hover:bg-gold/90">
            <Link href="/shop">Explore Collections</Link>
          </Button>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Best Sellers</h2>
            <Link href="/shop?filter=bestsellers" className="text-gold hover:underline flex items-center gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {bestSellers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No best sellers available at the moment</p>
            </div>
          ) : (
            <div className="relative group">
              {canScrollLeft && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => scroll("left")}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}
              <div
                ref={bestSellersRef}
                className="flex overflow-x-auto gap-6 pb-4 scroll-smooth hide-scrollbar snap-x snap-mandatory"
                onScroll={checkScrollButtons}
              >
                {bestSellers.map((product) => (
                  <div key={product.id} className="flex-none w-[280px] snap-start">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-white rounded-lg shadow-lg overflow-hidden"
                    >
                      <div className="relative aspect-[3/4]">
                        <Image
                          src={product.imageUrl || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-black text-white">
                            Top Rated
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <Link
                          href={`/shop/${product.gender.toLowerCase()}/${product.category.toLowerCase()}/${product.id}`}
                        >
                          <h3 className="font-semibold mb-2 group-hover:text-gold transition-colors">{product.name}</h3>
                          <div className="flex items-center gap-1 mb-2">
                            {Array.from({ length: product.rating }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`${currency}-${product.priceIDR}`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="flex items-center gap-2"
                            >
                              <p className="text-lg font-bold text-gold">
                                {formatPrice(convertPrice(product.priceIDR))}
                              </p>
                              {product.originalPriceIDR && (
                                <p className="text-sm text-gray-500 line-through">
                                  {formatPrice(convertPrice(product.originalPriceIDR))}
                                </p>
                              )}
                            </motion.div>
                          </AnimatePresence>
                          <p className="text-sm text-gray-500">{product.sales} sold</p>
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
              {canScrollRight && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => scroll("right")}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Hot Deals Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Hot Deals</h2>
          {hotDeals.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No deals available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {hotDeals.map((deal) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group overflow-hidden rounded-lg"
                >
                  <Image
                    src={deal.imageUrl || "/placeholder.svg"}
                    alt={deal.name}
                    width={600}
                    height={400}
                    className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 p-6 flex flex-col justify-end">
                    <Badge className="w-fit mb-4 bg-red-500 text-white">{deal.discount}% OFF</Badge>
                    <h3 className="text-white text-2xl font-bold mb-2">{deal.name}</h3>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${currency}-${deal.priceIDR}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex items-center gap-3"
                      >
                        <span className="text-white text-xl font-bold">{formatPrice(convertPrice(deal.priceIDR))}</span>
                        {deal.originalPriceIDR && (
                          <span className="text-gray-300 line-through">
                            {formatPrice(convertPrice(deal.originalPriceIDR))}
                          </span>
                        )}
                      </motion.div>
                    </AnimatePresence>
                    <Button asChild className="mt-4 w-fit">
                      <Link href={`/shop/${deal.gender.toLowerCase()}/${deal.category.toLowerCase()}/${deal.id}`}>
                        Shop Now
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Showcase */}
      <CategorySection />

      {/* Social Media Section */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Connect With Us</h2>
          <div className="flex justify-center gap-8">
            <Link
              href={settings.socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
            >
              <Facebook className="w-8 h-8" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link
              href={settings.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
            >
              <Instagram className="w-8 h-8" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link
              href={settings.socialLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
            >
              <MessageCircle className="w-8 h-8" />
              <span className="sr-only">Telegram</span>
            </Link>
            <Link
              href={settings.socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
            >
              <Phone className="w-8 h-8" />
              <span className="sr-only">WhatsApp</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

