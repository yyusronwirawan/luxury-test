"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import { toast } from "sonner"
import { websocketService } from "../services/websocket"
import { productSyncService } from "@/app/services/sync"
import { storageService } from "@/app/services/storage"
import { productsService } from "../services/products"
import { deletedProductsService } from "../services/deletedProducts"

// Enhanced Product interface with stricter types
export interface Product {
  id: number
  name: string
  price: number
  description: string
  imageUrl: string
  category: string
  gender: "MAN" | "WOMAN"
  rating: number
  isNew: boolean
  isSale: boolean
  isBestSeller: boolean
  stock: number
  images: string[]
  sales: number
  status: "ACTIVE" | "DRAFT" | "ARCHIVED" | "SOLD" | "IN_STOCK" | "PRE_ORDER"
  dateAdded: string
  createdAt: string
  updatedAt: string
  discount?: number
  originalPrice?: number
  priceIDR: number
  views?: number
}

// Enhanced Category interface
export interface Category {
  id: string
  name: string
  slug: string
}

interface ProductHistory {
  id: number
  productId: number
  action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE"
  changes: Partial<Product>
  timestamp: string
  adminId: string
}

interface ProductStats {
  views: number
  lastViewed: string
  conversionRate: number
  revenue: number
  totalSales: number
  totalRevenue: number
}

interface ProductContextType {
  products: Product[]
  categories: Category[]
  filterProducts: (options: {
    gender?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    isNew?: boolean
    isSale?: boolean
    isBestSeller?: boolean
    status?: "ACTIVE" | "DRAFT" | "ARCHIVED" | "SOLD" | "IN_STOCK" | "PRE_ORDER"
  }) => Product[]
  getBestSellers: () => Product[]
  getSaleProducts: () => Product[]
  getProductsByCategory: (gender: string, category: string) => Product[]
  getCategoryBySlug: (slug: string) => Category | undefined
  incrementProductViews: (productId: number) => void
  getProductStats: (productId: number) => ProductStats
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void
  updateProduct: (id: number, updates: Partial<Product>) => void
  deleteProduct: (id: number) => Promise<DeleteProductResponse>
  addMediaItem: (item: { url: string; name: string; type: string }) => void
  deleteMediaItem: (id: string) => void
  mediaItems: { id: string; url: string; name: string; type: string; uploadedAt: string }[]
  getAllCategories: () => Category[]
  getNewArrivals: () => Product[]
  updateStock: (productId: number, stock: number) => void
  getProductHistory: (productId: number) => ProductHistory[]
  restoreProduct: (productId: number) => Promise<boolean>
  bulkDeleteProducts: (ids: number[]) => Promise<DeleteProductResponse[]>
  bulkUpdateProducts: (updates: { id: number; changes: Partial<Product> }[]) => Promise<boolean>
  exportProducts: () => Promise<Blob>
  importProducts: (file: File) => Promise<boolean>
  clearAllData: () => void
  restoreFromBackup: () => boolean
  updatePricesWithCurrency: (currency: string, exchangeRates: { USD: number; THB: number }) => void
}

interface DeleteProductResponse {
  success: boolean
  message: string
}

// Initial data
const INITIAL_PRODUCTS: Product[] = []

const initialCategories: Category[] = [
  { id: "1", name: "BAJU", slug: "baju" },
  { id: "2", name: "CELANA", slug: "celana" },
  { id: "3", name: "SWETER", slug: "sweter" },
  { id: "4", name: "HODDIE", slug: "hoddie" },
  { id: "5", name: "JAM TANGAN", slug: "jam-tangan" },
  { id: "6", name: "PARFUM", slug: "parfum" },
]

// Create context
const ProductContext = createContext<ProductContextType | undefined>(undefined)

// Create provider component
export function ProductProvider({ children }: { children: React.ReactNode }) {
  // Initialize products with proper error handling and default values
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      try {
        console.log("Initializing ProductContext...")
        const savedProducts = productsService.getProducts()
        console.log("Loaded products:", savedProducts)
        return savedProducts
      } catch (error) {
        console.error("Error initializing products:", error)
        toast.error("Failed to load products. Using default products.")
        return productsService.getDefaultProducts()
      }
    }
    return []
  })

  // Initialize categories
  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCategories = localStorage.getItem("categories")
        if (savedCategories) {
          return JSON.parse(savedCategories)
        }
      } catch (error) {
        console.error("Error loading categories:", error)
      }
    }
    return initialCategories
  })

  const [mediaItems, setMediaItems] = useState<
    { id: string; url: string; name: string; type: string; uploadedAt: string }[]
  >([])
  const [productHistory, setProductHistory] = useState<ProductHistory[]>([])
  const [productStats, setProductStats] = useState<Record<number, ProductStats>>({})

  // Calculate category counts only when products change
  const categoryCounts = useMemo(() => {
    return products.reduce(
      (acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }, [products])

  // Update categories with counts only when products change
  useEffect(() => {
    const updatedCategories = categories.map((category) => ({
      ...category,
      productCount: categoryCounts[category.name] || 0,
    }))

    // Only update if counts have changed
    const hasChanges = updatedCategories.some(
      (category, index) => category.productCount !== categories[index].productCount,
    )

    if (hasChanges) {
      setCategories(updatedCategories)
    }
  }, [categories, categoryCounts])

  // Save products to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        console.log("Saving products to localStorage:", products)
        productsService.saveProducts(products)
      } catch (error) {
        console.error("Error saving products:", error)
        toast.error("Failed to save products")
      }
    }
  }, [products])

  // Save categories to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("categories", JSON.stringify(categories))
    }
  }, [categories])

  // Subscribe to product updates from other components/pages
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "products" && e.newValue) {
        try {
          const newProducts = JSON.parse(e.newValue)
          console.log("Products updated from storage:", newProducts)
          setProducts(newProducts)
        } catch (error) {
          console.error("Error handling storage change:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Subscribe to WebSocket updates
  useEffect(() => {
    const unsubscribe = websocketService.subscribe("PRODUCT_UPDATE", (updatedProduct: Product) => {
      console.log("Received product update via WebSocket:", updatedProduct)
      setProducts((prevProducts) => {
        const newProducts = prevProducts.map((product) =>
          product.id === updatedProduct.id ? { ...updatedProduct, updatedAt: new Date().toISOString() } : product,
        )
        return newProducts
      })
    })

    return () => unsubscribe()
  }, [])

  // Track product history
  const addToHistory = useCallback((productId: number, action: ProductHistory["action"], changes: Partial<Product>) => {
    const historyEntry: ProductHistory = {
      id: Date.now(),
      productId,
      action,
      changes,
      timestamp: new Date().toISOString(),
      adminId: "admin", // In a real app, get this from auth context
    }
    setProductHistory((prev) => [historyEntry, ...prev])
  }, [])

  // Enhanced filter function
  const filterProducts = useCallback(
    (options: {
      gender?: string
      category?: string
      minPrice?: number
      maxPrice?: number
      isNew?: boolean
      isSale?: boolean
      isBestSeller?: boolean
      status?: "ACTIVE" | "DRAFT" | "ARCHIVED" | "SOLD" | "IN_STOCK" | "PRE_ORDER"
    }) => {
      console.log("Filtering products with options:", options)
      console.log("Available products:", products)

      const filtered = products.filter((product) => {
        if (options.gender && product.gender.toLowerCase() !== options.gender.toLowerCase()) return false
        if (options.category && product.category !== options.category) return false
        if (options.minPrice !== undefined && product.priceIDR < options.minPrice) return false
        if (options.maxPrice !== undefined && product.priceIDR > options.maxPrice) return false
        if (options.isNew !== undefined && product.isNew !== options.isNew) return false
        if (options.isSale !== undefined && product.isSale !== options.isSale) return false
        if (options.isBestSeller !== undefined && product.isBestSeller !== options.isBestSeller) return false
        if (options.status && product.status !== options.status) return false
        return true
      })

      console.log("Filtered products:", filtered)
      return filtered
    },
    [products],
  )

  const getBestSellers = useCallback(
    () => products.filter((product) => product.isBestSeller && product.status === "IN_STOCK"),
    [products],
  )

  const getSaleProducts = useCallback(
    () => products.filter((product) => product.isSale && product.status === "IN_STOCK"),
    [products],
  )

  const getProductsByCategory = useCallback(
    (gender: string, category: string) =>
      products.filter(
        (product) =>
          product.gender.toLowerCase() === gender.toLowerCase() &&
          product.category.toLowerCase() === category.toLowerCase() &&
          product.status === "IN_STOCK",
      ),
    [products],
  )

  const getCategoryBySlug = useCallback(
    (slug: string) => categories.find((category) => category.slug === slug),
    [categories],
  )

  const incrementProductViews = useCallback((productId: number) => {
    // Implement view tracking logic here
    console.log(`Incrementing views for product ${productId}`)
  }, [])

  const getProductStats = useCallback(
    (productId: number) => {
      const product = products.find((p) => p.id === productId)
      return {
        totalSales: product?.sales || 0,
        totalRevenue: (product?.sales || 0) * (product?.price || 0),
        views: 0,
        lastViewed: "",
        conversionRate: 0,
        revenue: 0,
      }
    },
    [products],
  )

  // Enhanced addProduct function with validation
  const addProduct = useCallback(
    (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
      try {
        console.log("Adding new product:", product)
        const newProduct = {
          ...product,
          id: Math.max(...products.map((p) => p.id), 0) + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dateAdded: new Date().toISOString(),
          views: 0,
        }

        if (!isValidProduct(newProduct)) {
          throw new Error("Invalid product data")
        }

        setProducts((prev) => {
          const updated = [...prev, newProduct]
          // Notify other clients
          websocketService.send({
            type: "PRODUCT_UPDATE",
            payload: newProduct,
          })
          return updated
        })

        toast.success("Product added successfully")
      } catch (error) {
        console.error("Error adding product:", error)
        toast.error("Failed to add product")
        throw error
      }
    },
    [products],
  )

  const updateProduct = useCallback((id: number, updates: Partial<Product>) => {
    setProducts((prevProducts) => {
      const updatedProducts = prevProducts.map((product) =>
        product.id === id
          ? {
              ...product,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : product,
      )

      // Add to history
      const historyEntry: ProductHistory = {
        id: Date.now(),
        productId: id,
        action: "UPDATE",
        changes: updates,
        timestamp: new Date().toISOString(),
        adminId: "admin",
      }
      setProductHistory((prev) => [historyEntry, ...prev])

      // Notify other clients
      const updatedProduct = updatedProducts.find((p) => p.id === id)
      if (updatedProduct) {
        websocketService.send({
          type: "PRODUCT_UPDATE",
          payload: updatedProduct,
        })
      }

      return updatedProducts
    })

    toast.success("Product updated successfully")
  }, [])

  const updateStock = useCallback((productId: number, stock: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, stock, updatedAt: new Date().toISOString() } : product,
      ),
    )

    // Notify other clients about the stock update
    websocketService.send({
      type: "STOCK_UPDATE",
      payload: { productId, stock },
    })
  }, [])

  // Enhanced delete function with proper persistence
  const deleteProduct = useCallback(
    async (id: number): Promise<DeleteProductResponse> => {
      try {
        const productToDelete = products.find((p) => p.id === id)
        if (!productToDelete) {
          return {
            success: false,
            message: `Product with id ${id} not found`,
          }
        }

        setProducts((currentProducts) => currentProducts.filter((product) => product.id !== id))

        // Add to history
        const historyEntry: ProductHistory = {
          id: Date.now(),
          productId: id,
          action: "DELETE",
          changes: productToDelete,
          timestamp: new Date().toISOString(),
          adminId: "admin",
        }
        setProductHistory((prev) => [historyEntry, ...prev])

        // Notify other clients
        websocketService.send({
          type: "PRODUCT_DELETE",
          payload: { id, name: productToDelete.name },
        })

        return {
          success: true,
          message: `Product "${productToDelete.name}" has been deleted successfully`,
        }
      } catch (error) {
        console.error("Error deleting product:", error)
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to delete product",
        }
      }
    },
    [products],
  )

  const addMediaItem = useCallback((item: { url: string; name: string; type: string }) => {
    const newItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      uploadedAt: new Date().toISOString(),
    }
    setMediaItems((prevItems) => [...prevItems, newItem])
    toast.success("Media item added successfully")
  }, [])

  const deleteMediaItem = useCallback((id: string) => {
    setMediaItems((prevItems) => prevItems.filter((item) => item.id !== id))
    toast.success("Media item deleted successfully")
  }, [])

  const getAllCategories = useCallback(() => {
    return categories
  }, [categories])

  const getNewArrivals = useCallback(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return products
      .filter(
        (product) => (product.isNew || new Date(product.dateAdded) > thirtyDaysAgo) && product.status === "IN_STOCK",
      )
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
  }, [products])

  // Enhanced restore function
  const restoreProduct = useCallback(
    async (productId: number): Promise<boolean> => {
      try {
        // Remove from deleted products list
        deletedProductsService.removeDeletedProduct(productId)

        // Get the product from initial data or backup
        const productToRestore = INITIAL_PRODUCTS.find((p) => p.id === productId)

        if (!productToRestore) {
          throw new Error("Product not found")
        }

        // Add back to active products
        setProducts((prev) => [...prev, { ...productToRestore, status: "IN_STOCK" }])

        addToHistory(productId, "RESTORE", productToRestore)

        return true
      } catch (error) {
        console.error("Error restoring product:", error)
        return false
      }
    },
    [addToHistory],
  )

  // Bulk operations
  const bulkDeleteProducts = useCallback(
    async (ids: number[]): Promise<DeleteProductResponse[]> => {
      const results = await Promise.all(ids.map((id) => deleteProduct(id)))

      // Refresh products after bulk delete
      const updatedProducts = await productsService.getProducts()
      setProducts(updatedProducts)

      return results
    },
    [deleteProduct],
  )

  const bulkUpdateProducts = useCallback(
    async (updates: { id: number; changes: Partial<Product> }[]): Promise<boolean> => {
      try {
        setProducts((prev) => {
          const updated = [...prev]
          updates.forEach(({ id, changes }) => {
            const index = updated.findIndex((p) => p.id === id)
            if (index !== -1) {
              updated[index] = { ...updated[index], ...changes }
              addToHistory(id, "UPDATE", changes)
            }
          })
          return updated
        })
        return true
      } catch (error) {
        console.error("Error in bulk update:", error)
        return false
      }
    },
    [addToHistory],
  )

  // Export/Import functionality
  const exportProducts = useCallback(async (): Promise<Blob> => {
    const data = {
      products,
      exportDate: new Date().toISOString(),
      version: "2.0",
    }
    return new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  }, [products])

  const importProducts = useCallback(async (file: File): Promise<boolean> => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.products || !Array.isArray(data.products)) {
        throw new Error("Invalid import file format")
      }

      setProducts(data.products)
      return true
    } catch (error) {
      console.error("Error importing products:", error)
      return false
    }
  }, [])

  // Add new utility functions
  const clearAllData = useCallback(() => {
    try {
      productsService.clearAllProducts()
      deletedProductsService.clearDeletedProducts()
      setProducts([])
      setCategories([])
      toast.success("All data cleared successfully")
    } catch (error) {
      toast.error("Failed to clear data")
    }
  }, [])

  const restoreFromBackup = useCallback(() => {
    try {
      if (productsService.restoreFromBackup()) {
        setProducts(productsService.getProducts())
        setCategories(storageService.getCategories())
        toast.success("Data restored from backup")
        return true
      }
      toast.error("No backup found")
      return false
    } catch (error) {
      toast.error("Failed to restore from backup")
      return false
    }
  }, [])

  const updatePricesWithCurrency = useCallback((currency: string, exchangeRates: { USD: number; THB: number }) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => ({
        ...product,
        price:
          currency === "USD"
            ? product.priceIDR * exchangeRates.USD
            : currency === "THB"
              ? product.priceIDR * exchangeRates.THB
              : product.priceIDR,
      })),
    )
  }, [])

  const contextValue = useMemo(
    () => ({
      products,
      categories,
      filterProducts,
      getBestSellers,
      getSaleProducts,
      getProductsByCategory,
      getCategoryBySlug,
      incrementProductViews,
      getProductStats,
      addProduct,
      updateProduct,
      updateStock,
      deleteProduct,
      addMediaItem,
      deleteMediaItem,
      mediaItems,
      getAllCategories,
      getNewArrivals,
      getProductHistory: (productId: number) => productHistory.filter((h) => h.productId === productId),
      restoreProduct,
      bulkDeleteProducts,
      bulkUpdateProducts,
      exportProducts,
      importProducts,
      clearAllData,
      restoreFromBackup,
      updatePricesWithCurrency,
    }),
    [
      products,
      categories,
      filterProducts,
      getBestSellers,
      getSaleProducts,
      getProductsByCategory,
      getCategoryBySlug,
      incrementProductViews,
      getProductStats,
      addProduct,
      updateProduct,
      updateStock,
      deleteProduct,
      addMediaItem,
      deleteMediaItem,
      mediaItems,
      getAllCategories,
      getNewArrivals,
      productHistory,
      restoreProduct,
      bulkDeleteProducts,
      bulkUpdateProducts,
      exportProducts,
      importProducts,
      clearAllData,
      restoreFromBackup,
      updatePricesWithCurrency,
    ],
  )

  return <ProductContext.Provider value={contextValue}>{children}</ProductContext.Provider>
}

// Validation function for Product type
function isValidProduct(product: any): product is Product {
  return (
    typeof product === "object" &&
    product !== null &&
    typeof product.id === "number" &&
    typeof product.name === "string" &&
    typeof product.price === "number" &&
    typeof product.priceIDR === "number" &&
    typeof product.description === "string" &&
    typeof product.imageUrl === "string" &&
    typeof product.category === "string" &&
    (product.gender === "MAN" || product.gender === "WOMAN") &&
    typeof product.rating === "number" &&
    typeof product.isNew === "boolean" &&
    typeof product.isSale === "boolean" &&
    typeof product.isBestSeller === "boolean" &&
    typeof product.stock === "number" &&
    Array.isArray(product.images) &&
    typeof product.sales === "number" &&
    typeof product.status === "string" &&
    typeof product.dateAdded === "string" &&
    typeof product.createdAt === "string" &&
    typeof product.updatedAt === "string"
  )
}

// Create hook for using the context
export function useProducts() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider")
  }
  return context
}

