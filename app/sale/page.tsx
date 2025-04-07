"use client"

import { useState } from "react"
import ProductCard from "@/app/components/ProductCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts } from "@/app/contexts/ProductContext"

export default function SalePage() {
  const { getSaleProducts } = useProducts()
  const [sortBy, setSortBy] = useState("discount")

  const products = getSaleProducts()

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "discount":
        return (b.discount || 0) - (a.discount || 0)
      case "price-asc":
        return a.price - b.price
      case "price-desc":
        return b.price - a.price
      default:
        return 0
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="bg-red-600 text-white py-4 px-6 rounded-lg mb-6">
          <h1 className="text-4xl font-bold mb-2">Sale</h1>
          <p className="text-lg">Up to 50% off on selected items</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{products.length} products on sale</p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="discount">Biggest Discount</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">No sale products found</h3>
          <p className="text-gray-500">Check back later for new sales</p>
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

