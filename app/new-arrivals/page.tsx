"use client"

import { useState, useEffect } from "react"
import ProductCard from "@/app/components/ProductCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts } from "@/app/contexts/ProductContext"
import { Loader2, PackageOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ErrorBoundary } from "react-error-boundary"

const ITEMS_PER_PAGE = 12

export default function NewArrivalsPage() {
  const { getNewArrivals } = useProducts()
  const [sortBy, setSortBy] = useState("newest")
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const newArrivals = getNewArrivals()

  const sortedProducts = [...newArrivals].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price
      case "price-desc":
        return b.price - a.price
      default: // "newest"
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    }
  })

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Oops! Something went wrong.</h3>
          <p className="text-gray-500">Please try refreshing the page.</p>
        </div>
      }
    >
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">New Arrivals</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our latest collection of premium fashion and fragrances. Be the first to experience our newest
            styles and scents.
          </p>
        </div>

        {paginatedProducts.length > 0 ? (
          <>
            <div className="flex justify-end mb-8">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <PackageOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No New Arrivals</h3>
            <p className="text-gray-500 mb-6">
              We don't have any new products at the moment. Check back soon for updates!
            </p>
            <Button asChild>
              <Link href="/shop">Browse All Products</Link>
            </Button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

