interface DeletedProduct {
  id: number
  name: string
  deletedAt: string
}

class DeletedProductsService {
  private static instance: DeletedProductsService
  private readonly STORAGE_KEY = "deleted-products-v1"

  private constructor() {}

  static getInstance(): DeletedProductsService {
    if (!DeletedProductsService.instance) {
      DeletedProductsService.instance = new DeletedProductsService()
    }
    return DeletedProductsService.instance
  }

  getDeletedProducts(): DeletedProduct[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error loading deleted products:", error)
      return []
    }
  }

  addDeletedProduct(product: { id: number; name: string }): void {
    try {
      const deletedProducts = this.getDeletedProducts()
      const newDeletedProduct: DeletedProduct = {
        id: product.id,
        name: product.name,
        deletedAt: new Date().toISOString(),
      }

      deletedProducts.push(newDeletedProduct)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(deletedProducts))
    } catch (error) {
      console.error("Error adding deleted product:", error)
    }
  }

  isProductDeleted(productId: number): boolean {
    const deletedProducts = this.getDeletedProducts()
    return deletedProducts.some((p) => p.id === productId)
  }

  removeDeletedProduct(productId: number): void {
    try {
      const deletedProducts = this.getDeletedProducts()
      const filtered = deletedProducts.filter((p) => p.id !== productId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error("Error removing deleted product:", error)
    }
  }

  clearDeletedProducts(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]))
  }
}

export const deletedProductsService = DeletedProductsService.getInstance()

