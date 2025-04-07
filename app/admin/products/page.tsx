"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Star, Package, ArrowUpDown } from "lucide-react"
import Image from "next/image"
import { ProductForm } from "../components/ProductForm"
import { useProducts } from "@/app/contexts/ProductContext"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Download, Upload } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DeleteConfirmation } from "../components/DeleteConfirmation"
import type { Product } from "@/types/Product"
import { motion } from "framer-motion"

export default function ProductsPage() {
  // State declarations - all hooks at the top level
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [genderFilter, setGenderFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<"name" | "price">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    productId: null as number | null,
    productName: "",
  })

  // Context hook
  const { products, deleteProduct, importProducts, exportProducts, bulkDeleteProducts, bulkUpdateProducts } =
    useProducts()

  // Memoized filtered products
  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) || product.description.toLowerCase().includes(searchLower),
      )
    }

    if (categoryFilter !== "all") {
      result = result.filter((product) => product.category === categoryFilter)
    }

    if (genderFilter !== "all") {
      result = result.filter((product) => product.gender === genderFilter)
    }

    if (statusFilter !== "all") {
      result = result.filter((product) => product.status === statusFilter)
    }

    result.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      const direction = sortDirection === "asc" ? 1 : -1

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * direction
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * direction
      }

      return 0
    })

    return result
  }, [products, searchTerm, categoryFilter, genderFilter, statusFilter, sortField, sortDirection])

  // Effects
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Callbacks
  const handleSort = useCallback((field: "name" | "price") => {
    setSortField(field)
    setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
  }, [])

  const handleDelete = useCallback(
    async (productId: number) => {
      try {
        const response = await deleteProduct(productId)
        if (!response.success) {
          throw new Error(response.message)
        }
        setSelectedProducts((current) => current.filter((id) => id !== productId))
        // Use useEffect to show toast after render
        useEffect(() => {
          toast.success(response.message)
        }, [response.message])
      } catch (error) {
        // Use useEffect to show error toast after render
        useEffect(() => {
          toast.error(error instanceof Error ? error.message : "Failed to delete product")
        }, [error])
      }
    },
    [deleteProduct],
  )

  const handleBulkAction = useCallback(
    async (action: string) => {
      if (!selectedProducts.length) return

      try {
        switch (action) {
          case "delete":
            await bulkDeleteProducts(selectedProducts)
            setSelectedProducts([])
            useEffect(() => {
              toast.success(`Successfully deleted ${selectedProducts.length} products`)
            }, [selectedProducts.length])
            break

          case "markInStock":
            await bulkUpdateProducts(
              selectedProducts.map((id) => ({
                id,
                changes: { status: "IN_STOCK" },
              })),
            )
            setSelectedProducts([])
            useEffect(() => {
              toast.success(`Updated ${selectedProducts.length} products`)
            }, [selectedProducts.length])
            break
        }
      } catch (error) {
        useEffect(() => {
          toast.error("Failed to perform bulk action")
        }, [])
      }
    },
    [selectedProducts, bulkDeleteProducts, bulkUpdateProducts],
  )

  const handleImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      setIsImporting(true)
      try {
        const success = await importProducts(file)
        if (success) {
          useEffect(() => {
            toast.success("Products imported successfully")
          }, [])
        } else {
          throw new Error("Import failed")
        }
      } catch (error) {
        useEffect(() => {
          toast.error("Failed to import products")
        }, [])
      } finally {
        setIsImporting(false)
      }
    },
    [importProducts],
  )

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      const blob = await exportProducts()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `products-export-${new Date().toISOString()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      useEffect(() => {
        toast.success("Products exported successfully")
      }, [])
    } catch (error) {
      useEffect(() => {
        toast.error("Failed to export products")
      }, [])
    } finally {
      setIsExporting(false)
    }
  }, [exportProducts])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-200">
        <div className="text-center">
          <motion.div
            className="w-32 h-32 mb-8 mx-auto"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
              borderRadius: ["20%", "50%", "20%"],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              times: [0, 0.5, 1],
              repeat: Number.POSITIVE_INFINITY,
            }}
          >
            <Package className="w-full h-full text-gold" />
          </motion.div>
          <motion.h2
            className="text-2xl font-bold text-gray-800 mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          >
            Loading Products
          </motion.h2>
          <motion.div className="flex justify-center space-x-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-3 h-3 bg-gold rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: index * 0.2,
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} products found
            {selectedProducts.length > 0 && ` (${selectedProducts.length} selected)`}
          </p>
        </div>
        <div className="flex gap-4">
          {selectedProducts.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Bulk Actions ({selectedProducts.length})</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkAction("delete")}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("markInStock")}>
                  <Package className="w-4 h-4 mr-2" />
                  Mark as In Stock
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" disabled={isImporting}>
                  <label className="cursor-pointer flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                    <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                  </label>
                </Button>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl" aria-describedby="add-product-description">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription id="add-product-description">
                      Fill in the details to add a new product to your inventory.
                    </DialogDescription>
                  </DialogHeader>
                  <ProductForm onSubmit={() => setIsAddDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="IN_STOCK">In Stock</SelectItem>
            <SelectItem value="SOLD">Sold</SelectItem>
            <SelectItem value="PRE_ORDER">Pre-Order</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProducts(filteredProducts.map((p) => p.id))
                    } else {
                      setSelectedProducts([])
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </TableHead>
              <TableHead>Image</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("name")} className="flex items-center">
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("price")} className="flex items-center">
                  Price
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => {
                      setSelectedProducts((current) =>
                        current.includes(product.id)
                          ? current.filter((id) => id !== product.id)
                          : [...current, product.id],
                      )
                    }}
                    className="rounded border-gray-300"
                  />
                </TableCell>
                <TableCell>
                  <Image
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    width={50}
                    height={50}
                    className="rounded-md object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.gender}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.status === "IN_STOCK" ? "default" : product.status === "SOLD" ? "secondary" : "outline"
                    }
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span>{product.rating}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() =>
                        setDeleteConfirmation({
                          isOpen: true,
                          productId: product.id,
                          productName: product.name,
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-2xl" aria-describedby="edit-product-description">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription id="edit-product-description">
                Fill in the details to edit this product.
              </DialogDescription>
            </DialogHeader>
            <ProductForm product={editingProduct} onSubmit={() => setEditingProduct(null)} />
          </DialogContent>
        </Dialog>
      )}

      <DeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, productId: null, productName: "" })}
        onConfirm={() => {
          if (deleteConfirmation.productId) {
            handleDelete(deleteConfirmation.productId)
          }
          setDeleteConfirmation({ isOpen: false, productId: null, productName: "" })
        }}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteConfirmation.productName}"? This action cannot be undone.`}
      />
    </div>
  )
}

