"use client"

import { useState, useEffect, useCallback } from "react"
import { useProducts } from "@/app/contexts/ProductContext"
import ProductCard from "@/app/components/ProductCard"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ShoppingBag, Grid, List, ChevronUp, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 12

export default function ShopPage() {
  const { products, categories } = useProducts()
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedGenders, setSelectedGenders] = useState<string[]>([])
  const [showNew, setShowNew] = useState(false)
  const [showSale, setShowSale] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredProducts, setFilteredProducts] = useState<typeof products>([])
  const [displayProducts, setDisplayProducts] = useState<typeof products>([])
  const [activeFilters, setActiveFilters] = useState(0)

  // Debug logging
  useEffect(() => {
    console.log("Products from context:", products)
    console.log("Available categories:", categories)
  }, [products, categories])

  // Initialize products
  useEffect(() => {
    const initializeProducts = async () => {
      try {
        setIsLoading(true)
        console.log("Initializing shop with products:", products)

        // Ensure all products are initially displayed
        setFilteredProducts(products)
        setDisplayProducts(products)

        // Reset active filters count
        setActiveFilters(0)

        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (err) {
        console.error("Error initializing products:", err)
        toast.error("Failed to load products")
      } finally {
        setIsLoading(false)
      }
    }

    initializeProducts()
  }, [products])

  // Apply filters and update counts
  useEffect(() => {
    console.log("Starting filter application...")
    let activeFilterCount = 0
    let result = [...products]

    // Track each filter application
    if (selectedCategories.length > 0) {
      result = result.filter((product) => selectedCategories.includes(product.category))
      activeFilterCount++
      console.log(`After category filter (${selectedCategories.join(", ")}):`, result.length)
    }

    if (selectedGenders.length > 0) {
      result = result.filter((product) => selectedGenders.includes(product.gender))
      activeFilterCount++
      console.log(`After gender filter (${selectedGenders.join(", ")}):`, result.length)
    }

    const minPrice = priceRange[0] * 1000
    const maxPrice = priceRange[1] * 1000
    if (minPrice > 0 || maxPrice < 1000000) {
      result = result.filter((product) => {
        const price = product.priceIDR
        return price >= minPrice && price <= maxPrice
      })
      activeFilterCount++
      console.log(`After price filter (${minPrice}-${maxPrice}):`, result.length)
    }

    if (showNew) {
      result = result.filter((product) => product.isNew)
      activeFilterCount++
      console.log("After new filter:", result.length)
    }

    if (showSale) {
      result = result.filter((product) => product.isSale)
      activeFilterCount++
      console.log("After sale filter:", result.length)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (product) => product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query),
      )
      activeFilterCount++
      console.log(`After search filter (${searchQuery}):`, result.length)
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.priceIDR - b.priceIDR
        case "price-desc":
          return b.priceIDR - a.priceIDR
        case "bestselling":
          return (b.sales || 0) - (a.sales || 0)
        case "rating":
          return b.rating - a.rating
        default: // "newest"
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
      }
    })

    // Update state
    setActiveFilters(activeFilterCount)
    setFilteredProducts(result)
    setDisplayProducts(result.slice(0, currentPage * ITEMS_PER_PAGE))

    console.log("Filter application complete:", {
      totalProducts: products.length,
      filteredCount: result.length,
      displayCount: result.slice(0, currentPage * ITEMS_PER_PAGE).length,
      activeFilters: activeFilterCount,
    })
  }, [products, selectedCategories, selectedGenders, priceRange, showNew, showSale, searchQuery, sortBy, currentPage])

  const loadMore = useCallback(() => {
    if (currentPage * ITEMS_PER_PAGE < filteredProducts.length) {
      setCurrentPage((prev) => prev + 1)
      console.log("Loading more products, page:", currentPage + 1)
    }
  }, [currentPage, filteredProducts.length])

  const clearFilters = useCallback(() => {
    console.log("Clearing all filters...")
    setPriceRange([0, 1000])
    setSelectedCategories([])
    setSelectedGenders([])
    setShowNew(false)
    setShowSale(false)
    setSearchQuery("")
    setSortBy("newest")
    setCurrentPage(1)
    setActiveFilters(0)
    setFilteredProducts(products)
    setDisplayProducts(products)
    toast.success("All filters cleared")
  }, [products])

  // Status component to show current state
  const StatusBanner = () => (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
      <div className="text-sm text-yellow-800">
        <p>Total Products: {products.length}</p>
        <p>Filtered Products: {filteredProducts.length}</p>
        <p>Currently Showing: {displayProducts.length}</p>
        <p>Active Filters: {activeFilters}</p>
        <p>Current Page: {currentPage}</p>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <p>Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <StatusBanner />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Categories</h3>
            {categories.map((category) => (
              <div key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.name)}
                  onChange={() => {
                    setSelectedCategories((prev) =>
                      prev.includes(category.name) ? prev.filter((c) => c !== category.name) : [...prev, category.name],
                    )
                    setCurrentPage(1) // Reset to first page when filter changes
                  }}
                  className="mr-2"
                />
                <label htmlFor={`category-${category.id}`} className="text-sm">
                  {category.name} ({products.filter((p) => p.category === category.name).length})
                </label>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Gender</h3>
            {["MAN", "WOMAN"].map((gender) => (
              <div key={gender} className="flex items-center">
                <input
                  type="checkbox"
                  id={`gender-${gender}`}
                  checked={selectedGenders.includes(gender)}
                  onChange={() => {
                    setSelectedGenders((prev) =>
                      prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender],
                    )
                    setCurrentPage(1)
                  }}
                  className="mr-2"
                />
                <label htmlFor={`gender-${gender}`} className="text-sm">
                  {gender === "MAN" ? "Men" : "Women"}
                </label>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Price Range (IDR)</h3>
            <Slider
              min={0}
              max={1000}
              step={10}
              value={priceRange}
              onValueChange={(value) => {
                setPriceRange(value)
                setCurrentPage(1)
              }}
              className="mb-2"
            />
            <div className="flex justify-between text-sm">
              <span>Rp {(priceRange[0] * 1000).toLocaleString()}</span>
              <span>Rp {(priceRange[1] * 1000).toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Product Status</h3>
            <div className="flex items-center justify-between">
              <label htmlFor="show-new" className="text-sm">
                New Arrivals
              </label>
              <Switch
                id="show-new"
                checked={showNew}
                onCheckedChange={(checked) => {
                  setShowNew(checked)
                  setCurrentPage(1)
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="show-sale" className="text-sm">
                On Sale
              </label>
              <Switch
                id="show-sale"
                checked={showSale}
                onCheckedChange={(checked) => {
                  setShowSale(checked)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>

          <Button onClick={clearFilters} variant="outline" className="w-full">
            Clear Filters
          </Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="bestselling">Best Selling</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
                {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategories.map((category) => (
                <Badge key={category} variant="secondary" className="px-2 py-1">
                  {category}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => {
                      setSelectedCategories((prev) => prev.filter((c) => c !== category))
                      setCurrentPage(1)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {selectedGenders.map((gender) => (
                <Badge key={gender} variant="secondary" className="px-2 py-1">
                  {gender}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => {
                      setSelectedGenders((prev) => prev.filter((g) => g !== gender))
                      setCurrentPage(1)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {showNew && (
                <Badge variant="secondary" className="px-2 py-1">
                  New Arrivals
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => {
                      setShowNew(false)
                      setCurrentPage(1)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {showSale && (
                <Badge variant="secondary" className="px-2 py-1">
                  On Sale
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => {
                      setShowSale(false)
                      setCurrentPage(1)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}

          {/* Products Grid/List */}
          {displayProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <ShoppingBag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search query.</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "grid gap-6",
                  viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1",
                )}
              >
                <AnimatePresence mode="wait">
                  {displayProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <ProductCard {...product} viewMode={viewMode} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {currentPage * ITEMS_PER_PAGE < filteredProducts.length && (
                <div className="flex justify-center mt-8">
                  <Button onClick={loadMore}>
                    Load More ({filteredProducts.length - displayProducts.length} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

