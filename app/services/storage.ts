type StorageData = {
  version: number
  products: any[]
  deletedProducts: any[]
  lastUpdated: string
  categories: any[]
}

const CURRENT_VERSION = 1
const STORAGE_KEY = "luxury-store-data"

class StorageService {
  private static instance: StorageService
  private data: StorageData

  private constructor() {
    this.data = this.loadData()
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  private loadData(): StorageData {
    if (typeof window === "undefined") {
      return this.getInitialData()
    }

    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (!savedData) {
        return this.getInitialData()
      }

      const parsedData = JSON.parse(savedData)

      // Handle data migration if version is old
      if (!parsedData.version || parsedData.version < CURRENT_VERSION) {
        return this.migrateData(parsedData)
      }

      return parsedData
    } catch (error) {
      console.error("Error loading data:", error)
      return this.getInitialData()
    }
  }

  private getInitialData(): StorageData {
    return {
      version: CURRENT_VERSION,
      products: [],
      deletedProducts: [],
      lastUpdated: new Date().toISOString(),
      categories: [],
    }
  }

  private migrateData(oldData: any): StorageData {
    // Handle data migration between versions
    const newData = this.getInitialData()

    // Migrate products
    if (Array.isArray(oldData.products)) {
      newData.products = oldData.products
    }

    // Migrate deleted products
    if (Array.isArray(oldData.deletedProducts)) {
      newData.deletedProducts = oldData.deletedProducts
    } else if (localStorage.getItem("deleted_products")) {
      try {
        newData.deletedProducts = JSON.parse(localStorage.getItem("deleted_products") || "[]")
      } catch (e) {
        console.error("Error migrating deleted products:", e)
      }
    }

    // Migrate categories
    if (Array.isArray(oldData.categories)) {
      newData.categories = oldData.categories
    }

    return newData
  }

  private saveData(): void {
    if (typeof window === "undefined") return

    try {
      // Update timestamp
      this.data.lastUpdated = new Date().toISOString()

      // Save main data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))

      // Create backup
      localStorage.setItem(`${STORAGE_KEY}-backup`, JSON.stringify(this.data))

      // Clean up old storage keys
      localStorage.removeItem("products_v2")
      localStorage.removeItem("deleted_products")
      localStorage.removeItem("categories")
    } catch (error) {
      console.error("Error saving data:", error)
      throw new Error("Failed to save data")
    }
  }

  getProducts(): any[] {
    return this.data.products
  }

  getDeletedProducts(): any[] {
    return this.data.deletedProducts
  }

  getCategories(): any[] {
    return this.data.categories
  }

  setProducts(products: any[]): void {
    this.data.products = products
    this.saveData()
  }

  addDeletedProduct(product: any): void {
    this.data.deletedProducts.push({
      ...product,
      deletedAt: new Date().toISOString(),
    })
    this.saveData()
  }

  removeDeletedProduct(productId: number): void {
    this.data.deletedProducts = this.data.deletedProducts.filter((p) => p.id !== productId)
    this.saveData()
  }

  setCategories(categories: any[]): void {
    this.data.categories = categories
    this.saveData()
  }

  clearAllData(): void {
    this.data = this.getInitialData()
    this.saveData()
  }

  restoreFromBackup(): boolean {
    try {
      const backup = localStorage.getItem(`${STORAGE_KEY}-backup`)
      if (backup) {
        this.data = JSON.parse(backup)
        this.saveData()
        return true
      }
      return false
    } catch (error) {
      console.error("Error restoring from backup:", error)
      return false
    }
  }
}

export const storageService = StorageService.getInstance()

