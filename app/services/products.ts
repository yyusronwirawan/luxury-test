import type { Product } from "../contexts/ProductContext"

// Helper function to validate Product type
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

class ProductsService {
  private static instance: ProductsService
  private readonly STORAGE_KEY = "products"
  private readonly BACKUP_KEY = "products_backup"

  private constructor() {
    // Initialize with empty array if storage is empty
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) {
        console.log("No products found in storage, initializing with empty array...")
        this.saveProducts([])
      }
    }
  }

  static getInstance(): ProductsService {
    if (!ProductsService.instance) {
      ProductsService.instance = new ProductsService()
    }
    return ProductsService.instance
  }

  getProducts(): Product[] {
    if (typeof window === "undefined") {
      console.log("Running on server, returning empty array")
      return []
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) {
        console.log("No products in storage, returning empty array")
        return []
      }

      const parsed = JSON.parse(stored)
      console.log("Parsed products from storage:", parsed)

      if (!Array.isArray(parsed) || !parsed.every(isValidProduct)) {
        console.error("Invalid product data in storage, returning empty array")
        return []
      }

      console.log("Successfully loaded products from storage:", parsed)
      return parsed
    } catch (error) {
      console.error("Error loading products:", error)
      return []
    }
  }

  saveProducts(products: Product[]): void {
    if (typeof window === "undefined") return

    try {
      console.log("Saving products to storage:", products)

      // Validate products before saving
      if (!Array.isArray(products) || !products.every(isValidProduct)) {
        throw new Error("Invalid product data")
      }

      // Save new products
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products))

      // Notify other components about the update
      window.dispatchEvent(new CustomEvent("productsUpdated", { detail: products }))

      console.log("Products saved successfully")
    } catch (error) {
      console.error("Error saving products:", error)
      throw new Error("Failed to save products")
    }
  }

  addProduct(product: Product): void {
    try {
      const products = this.getProducts()
      if (!isValidProduct(product)) {
        throw new Error("Invalid product data")
      }
      products.push(product)
      this.saveProducts(products)
    } catch (error) {
      console.error("Error adding product:", error)
      throw error
    }
  }

  updateProduct(id: number, updates: Partial<Product>): void {
    try {
      const products = this.getProducts()
      const index = products.findIndex((p) => p.id === id)
      if (index !== -1) {
        const updatedProduct = {
          ...products[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        if (!isValidProduct(updatedProduct)) {
          throw new Error("Invalid product data after update")
        }
        products[index] = updatedProduct
        this.saveProducts(products)
      }
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  }

  deleteProduct(id: number): void {
    try {
      const products = this.getProducts()
      const filtered = products.filter((p) => p.id !== id)
      this.saveProducts(filtered)
    } catch (error) {
      console.error("Error deleting product:", error)
      throw error
    }
  }

  restoreFromBackup(): Product[] | null {
    try {
      const backup = localStorage.getItem(this.BACKUP_KEY)
      if (backup) {
        const parsed = JSON.parse(backup)
        if (Array.isArray(parsed) && parsed.every(isValidProduct)) {
          localStorage.setItem(this.STORAGE_KEY, backup)
          return parsed
        }
      }
      return null
    } catch (error) {
      console.error("Error restoring from backup:", error)
      return null
    }
  }

  clearAllProducts(): void {
    try {
      // Backup current state before clearing
      const currentProducts = this.getProducts()
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(currentProducts))

      // Clear products
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]))
    } catch (error) {
      console.error("Error clearing products:", error)
      throw error
    }
  }
}

export const productsService = ProductsService.getInstance()

