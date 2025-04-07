"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useProducts } from "@/app/contexts/ProductContext"
import ProductCard from "@/app/components/ProductCard"
import { Loader2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Placeholder for CATEGORIES data.  This needs to be defined elsewhere in your application.
const CATEGORIES = [
  { slug: "tops", name: "Tops" },
  { slug: "bottoms", name: "Bottoms" },
  { slug: "dresses", name: "Dresses" },
  // Add other categories here...
]

export default function CategoryPage({ params }: { params: { gender: string; category: string } }) {
  const router = useRouter()
  const { getProductsByCategory, getCategoryBySlug } = useProducts()
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState("newest")

  // Convert URL-friendly category slug back to proper category name
  const categorySlug = params.category.toLowerCase()
  const categoryName = CATEGORIES.find((c) => c.slug === categorySlug)?.name

  const products = categoryName ? getProductsByCategory(params.gender, categoryName) : []

  // Sort products based on selection
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price
      case "price-desc":
        return b.price - a.price
      case "bestselling":
        return (b.sales || 0) - (a.sales || 0)
      default: // "newest"
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    }
  })

  useEffect(() => {
    if (!categoryName) {
      router.push("/shop")
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [categoryName, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!categoryName) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 capitalize">
          {params.gender}'s {categoryName}
        </h1>
        <p className="text-gray-600">
          {sortedProducts.length} {sortedProducts.length === 1 ? "product" : "products"} available
        </p>
      </div>

      {sortedProducts.length > 0 && (
        <div className="flex justify-end mb-8">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="bestselling">Best Selling</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {sortedProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ShoppingBag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
          <p className="text-gray-500 mb-6">We couldn't find any products in this category.</p>
          <Button onClick={() => router.push("/shop")}>Return to Shop</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  )
}

