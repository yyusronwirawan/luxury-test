export interface SalesAnalytics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  topSellingProducts: Array<{
    id: number
    name: string
    sales: number
    revenue: number
  }>
  salesByCategory: Array<{
    category: string
    sales: number
    revenue: number
  }>
  salesByGender: Array<{
    gender: string
    sales: number
    revenue: number
  }>
}

export interface InventoryAnalytics {
  totalProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  inventoryValue: number
  inventoryByCategory: Array<{
    category: string
    count: number
    value: number
  }>
}

export class AnalyticsService {
  calculateSalesAnalytics(products: Product[]): SalesAnalytics {
    const analytics: SalesAnalytics = {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      topSellingProducts: [],
      salesByCategory: [],
      salesByGender: [],
    }

    // Calculate total revenue and orders
    products.forEach((product) => {
      const revenue = product.sales * product.price
      analytics.totalRevenue += revenue
      analytics.totalOrders += product.sales
    })

    // Calculate average order value
    analytics.averageOrderValue = analytics.totalOrders > 0 ? analytics.totalRevenue / analytics.totalOrders : 0

    // Get top selling products
    analytics.topSellingProducts = products
      .map((product) => ({
        id: product.id,
        name: product.name,
        sales: product.sales,
        revenue: product.sales * product.price,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)

    // Calculate sales by category
    const categoryMap = new Map<string, { sales: number; revenue: number }>()
    products.forEach((product) => {
      const existing = categoryMap.get(product.category) || { sales: 0, revenue: 0 }
      categoryMap.set(product.category, {
        sales: existing.sales + product.sales,
        revenue: existing.revenue + product.sales * product.price,
      })
    })
    analytics.salesByCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      ...data,
    }))

    // Calculate sales by gender
    const genderMap = new Map<string, { sales: number; revenue: number }>()
    products.forEach((product) => {
      const existing = genderMap.get(product.gender) || { sales: 0, revenue: 0 }
      genderMap.set(product.gender, {
        sales: existing.sales + product.sales,
        revenue: existing.revenue + product.sales * product.price,
      })
    })
    analytics.salesByGender = Array.from(genderMap.entries()).map(([gender, data]) => ({
      gender,
      ...data,
    }))

    return analytics
  }

  calculateInventoryAnalytics(products: Product[]): InventoryAnalytics {
    const analytics: InventoryAnalytics = {
      totalProducts: products.length,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      inventoryValue: 0,
      inventoryByCategory: [],
    }

    const categoryMap = new Map<string, { count: number; value: number }>()

    products.forEach((product) => {
      // Calculate inventory alerts
      if (product.stock === 0) {
        analytics.outOfStockProducts++
      } else if (product.stock <= 5) {
        analytics.lowStockProducts++
      }

      // Calculate total inventory value
      const productValue = product.stock * product.price
      analytics.inventoryValue += productValue

      // Calculate inventory by category
      const existing = categoryMap.get(product.category) || { count: 0, value: 0 }
      categoryMap.set(product.category, {
        count: existing.count + 1,
        value: existing.value + productValue,
      })
    })

    analytics.inventoryByCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      ...data,
    }))

    return analytics
  }
}

export const analyticsService = new AnalyticsService()

