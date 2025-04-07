"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useProducts } from "@/app/contexts/ProductContext"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingBag } from "lucide-react"

// Define categories with their display names and slugs
const CATEGORIES = [
  { name: "BAJU", slug: "baju", image: "/categories/baju.jpg" },
  { name: "CELANA", slug: "celana", image: "/categories/celana.jpg" },
  { name: "SWETER", slug: "sweter", image: "/categories/sweter.jpg" },
  { name: "HODDIE", slug: "hoddie", image: "/categories/hoddie.jpg" },
  { name: "JAM TANGAN", slug: "jam-tangan", image: "/categories/jam-tangan.jpg" },
  { name: "PARFUM", slug: "parfum", image: "/categories/parfum.jpg" },
]

export function CategorySection() {
  const [selectedGender, setSelectedGender] = useState<"men" | "woman">("men")
  const [isLoading, setIsLoading] = useState(true)
  const { products } = useProducts()

  // Memoize category products to prevent unnecessary recalculations
  const categoryProducts = useMemo(() => {
    return CATEGORIES.map((category) => {
      const categoryProducts = products.filter(
        (product) =>
          product.category.toLowerCase() === category.name.toLowerCase() &&
          product.gender.toLowerCase() === (selectedGender === "men" ? "man" : "woman"),
      )

      // Get first available product image or fallback
      const firstProduct = categoryProducts[0]
      const categoryImage = firstProduct?.imageUrl || category.image || "/placeholder.svg"

      return {
        ...category,
        products: categoryProducts,
        imageUrl: categoryImage,
      }
    })
  }, [products, selectedGender])

  // Simulate loading state
  useState(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="flex justify-center gap-4 mb-8">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>

        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={selectedGender === "men" ? "default" : "outline"}
            onClick={() => setSelectedGender("men")}
            className="w-32"
          >
            Men
          </Button>
          <Button
            variant={selectedGender === "woman" ? "default" : "outline"}
            onClick={() => setSelectedGender("woman")}
            className="w-32"
          >
            Women
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {categoryProducts.map(({ name, slug, imageUrl, products }) => (
              <motion.div
                key={`${selectedGender}-${slug}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                {products.length === 0 ? (
                  // Empty category state
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <ShoppingBag className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-gray-500">No products available</p>
                    </div>
                  </div>
                ) : (
                  // Category with products
                  <Link
                    href={`/shop/${selectedGender}/${slug}`}
                    className="group relative aspect-square overflow-hidden rounded-lg shadow-md"
                  >
                    <Image
                      src={imageUrl || "/placeholder.svg"}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-white font-semibold text-2xl md:text-3xl">{name}</h3>
                      </div>
                    </div>
                  </Link>
                )}
                <div className="flex justify-between items-center p-4 bg-white">
                  <span className="text-sm text-gray-600">{products.length} Products</span>
                  {products.length > 0 && (
                    <Link
                      href={`/shop/${selectedGender}/${slug}`}
                      className="text-sm font-medium text-black hover:text-gold transition-colors"
                    >
                      Shop Now
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

