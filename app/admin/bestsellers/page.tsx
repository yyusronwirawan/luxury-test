"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Search, ArrowUpDown, Loader2 } from "lucide-react"
import Image from "next/image"
import { useProducts } from "@/app/contexts/ProductContext"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

export default function BestSellersPage() {
  const { products, updateProduct } = useProducts()
  const [searchTerm, setSearchTerm] = useState("")
  const [genderFilter, setGenderFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"name" | "sales">("sales")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGender = genderFilter === "all" || product.gender === genderFilter
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
      return matchesSearch && matchesGender && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      }
      const aSales = a.sales || 0
      const bSales = b.sales || 0
      return sortOrder === "asc" ? aSales - bSales : bSales - aSales
    })

  const toggleBestSeller = async (productId: number, currentStatus: boolean) => {
    try {
      await updateProduct(productId, {
        isBestSeller: !currentStatus,
        updatedAt: new Date().toISOString(),
      })
      toast.success(currentStatus ? "Product removed from best sellers" : "Product added to best sellers")
    } catch (error) {
      toast.error("Failed to update product status")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Best Sellers Management</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {products.filter((p) => p.isBestSeller).length} Best Sellers
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="MAN">Men</SelectItem>
              <SelectItem value="WOMAN">Women</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="BAJU">Baju</SelectItem>
              <SelectItem value="CELANA">Celana</SelectItem>
              <SelectItem value="SWETER">Sweter</SelectItem>
              <SelectItem value="HODDIE">Hoddie</SelectItem>
              <SelectItem value="JAM TANGAN">Jam Tangan</SelectItem>
              <SelectItem value="PARFUM">Parfum</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="font-semibold" onClick={() => toggleSort("name")}>
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Best Seller Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="rounded-lg object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.gender}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.sales}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span>{product.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.isBestSeller}
                        onCheckedChange={() => toggleBestSeller(product.id, product.isBestSeller)}
                      />
                      <span className="text-sm text-gray-500">{product.isBestSeller ? "Best Seller" : "Regular"}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-2">Best Sellers Guidelines</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
          <li>Products marked as Best Sellers will appear in the featured section on the home page</li>
          <li>Best Sellers should have a minimum rating of 4 stars</li>
          <li>Consider sales volume when selecting Best Sellers</li>
          <li>Update Best Sellers regularly to maintain fresh content</li>
          <li>Changes will be reflected immediately on the website</li>
        </ul>
      </div>
    </div>
  )
}

