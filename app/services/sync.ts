// Enhanced sync service with better error handling and real-time updates
import { websocketService } from "./websocketService" // Import the websocketService
import { productsService } from "./productsService" // Import the productsService
import type { Product } from "./Product" //Import the Product interface

class ProductSyncService {
  private static instance: ProductSyncService
  private syncInProgress = false
  private pendingChanges: Set<number> = new Set()
  private retryAttempts: Map<number, number> = new Map()
  private readonly MAX_RETRY_ATTEMPTS = 3

  private constructor() {
    this.setupWebSocket()
    this.setupStorageListener()
  }

  static getInstance(): ProductSyncService {
    if (!ProductSyncService.instance) {
      ProductSyncService.instance = new ProductSyncService()
    }
    return ProductSyncService.instance
  }

  private setupWebSocket() {
    websocketService.subscribe("PRODUCT_UPDATE", this.handleProductUpdate.bind(this))
    websocketService.subscribe("SYNC_REQUEST", this.handleSyncRequest.bind(this))

    // Reconnection handling
    websocketService.onReconnect(() => {
      this.requestFullSync()
    })
  }

  private setupStorageListener() {
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === "products" && e.newValue) {
          this.handleStorageChange(e.newValue)
        }
      })
    }
  }

  private handleProductUpdate(product: Product) {
    if (!this.syncInProgress) {
      this.pendingChanges.add(product.id)
      this.scheduleSyncCheck()
    }
  }

  private handleSyncRequest() {
    this.syncProducts()
  }

  private async handleStorageChange(newValue: string) {
    try {
      const products = JSON.parse(newValue)
      if (Array.isArray(products)) {
        websocketService.send({
          type: "SYNC_REQUEST",
          payload: products,
        })
      }
    } catch (error) {
      console.error("Error handling storage change:", error)
    }
  }

  private scheduleSyncCheck() {
    if (!this.syncInProgress) {
      setTimeout(() => this.syncProducts(), 1000)
    }
  }

  private async syncProducts() {
    if (this.syncInProgress || this.pendingChanges.size === 0) return

    this.syncInProgress = true

    try {
      const productsToSync = Array.from(this.pendingChanges)
      const results = await Promise.all(
        productsToSync.map(async (productId) => {
          try {
            await this.syncProduct(productId)
            this.pendingChanges.delete(productId)
            this.retryAttempts.delete(productId)
            return { success: true, productId }
          } catch (error) {
            return { success: false, productId, error }
          }
        }),
      )

      // Handle failed syncs
      results
        .filter((result) => !result.success)
        .forEach(({ productId }) => {
          const attempts = (this.retryAttempts.get(productId) || 0) + 1
          if (attempts < this.MAX_RETRY_ATTEMPTS) {
            this.retryAttempts.set(productId, attempts)
            this.pendingChanges.add(productId)
          } else {
            console.error(`Failed to sync product ${productId} after ${this.MAX_RETRY_ATTEMPTS} attempts`)
          }
        })
    } catch (error) {
      console.error("Error syncing products:", error)
    } finally {
      this.syncInProgress = false
      if (this.pendingChanges.size > 0) {
        this.scheduleSyncCheck()
      }
    }
  }

  private async syncProduct(productId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        websocketService.send({
          type: "SYNC_PRODUCT",
          payload: { productId },
        })
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  public requestFullSync() {
    websocketService.send({
      type: "FULL_SYNC_REQUEST",
      payload: null,
    })
  }

  public async forceSync(): Promise<void> {
    const products = productsService.getProducts()
    return new Promise((resolve, reject) => {
      try {
        websocketService.send({
          type: "FORCE_SYNC",
          payload: products,
        })
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
}

export const productSyncService = ProductSyncService.getInstance()

