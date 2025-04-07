import { toast } from "sonner"

interface SiteSettings {
  whatsappLink: string
  logoUrl: string
  faviconUrl: string
  siteTitle: string
  metaDescription: string
  heroTitle: string
  heroSubtitle: string
  businessHours: {
    open: string
    close: string
    timezone: string
  }
  orderTemplate: string
  customCss?: string
  socialLinks: {
    facebook: string
    instagram: string
    telegram: string
    whatsapp: string
  }
}

type SettingsSubscriber = (settings: SiteSettings) => void

class SiteSettingsManager {
  private static instance: SiteSettingsManager
  private settings: SiteSettings
  private subscribers: Set<SettingsSubscriber> = new Set()
  private readonly STORAGE_KEY = "site-settings"
  private readonly BACKUP_KEY = "site-settings-backup"
  private readonly HISTORY_KEY = "site-settings-history"
  private readonly MAX_HISTORY = 10

  private constructor() {
    this.settings = this.loadSettings()
    this.setupAutoSave()
  }

  static getInstance(): SiteSettingsManager {
    if (!SiteSettingsManager.instance) {
      SiteSettingsManager.instance = new SiteSettingsManager()
    }
    return SiteSettingsManager.instance
  }

  private getDefaultSettings(): SiteSettings {
    return {
      whatsappLink: "https://wa.me/1234567890",
      logoUrl: "/logo.png",
      faviconUrl: "/favicon.ico",
      siteTitle: "Luxe Fashion & Fragrance",
      metaDescription: "Discover premium fashion and exquisite fragrances",
      heroTitle: "Luxe Elegance",
      heroSubtitle: "Discover the epitome of style and sophistication",
      businessHours: {
        open: "09:00",
        close: "18:00",
        timezone: "Asia/Jakarta",
      },
      orderTemplate: "Hello! I would like to order:\n{items}\nTotal: {total}",
      socialLinks: {
        facebook: "https://facebook.com/luxefashion",
        instagram: "https://instagram.com/luxefashion",
        telegram: "https://t.me/luxefashion",
        whatsapp: "https://wa.me/1234567890",
      },
    }
  }

  private loadSettings(): SiteSettings {
    if (typeof window === "undefined") {
      return this.getDefaultSettings()
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) {
        const defaults = this.getDefaultSettings()
        this.saveSettings(defaults)
        return defaults
      }

      const parsed = JSON.parse(stored)
      return { ...this.getDefaultSettings(), ...parsed }
    } catch (error) {
      console.error("Error loading settings:", error)
      return this.getDefaultSettings()
    }
  }

  private saveSettings(settings: SiteSettings): void {
    if (typeof window === "undefined") return

    try {
      // Validate logo URL
      if (
        settings.logoUrl &&
        !settings.logoUrl.startsWith("data:") &&
        !settings.logoUrl.startsWith("http") &&
        !settings.logoUrl.startsWith("/")
      ) {
        throw new Error("Invalid logo URL format")
      }

      // Save main settings
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings))

      // Create backup
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(settings))

      // Update history
      const history = this.getSettingsHistory()
      history.unshift({
        timestamp: new Date().toISOString(),
        settings: settings,
      })

      // Keep only MAX_HISTORY entries
      while (history.length > this.MAX_HISTORY) {
        history.pop()
      }

      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history))

      // Force a reload of the image by appending a timestamp
      if (settings.logoUrl && !settings.logoUrl.startsWith("data:")) {
        settings.logoUrl = `${settings.logoUrl}?t=${Date.now()}`
      }

      // Notify subscribers
      this.notifySubscribers()

      console.log("Settings saved successfully:", settings)
    } catch (error) {
      console.error("Error saving settings:", error)
      throw new Error("Failed to save settings")
    }
  }

  private setupAutoSave() {
    if (typeof window === "undefined") return

    // Listen for storage events from other tabs
    window.addEventListener("storage", (event) => {
      if (event.key === this.STORAGE_KEY && event.newValue) {
        try {
          this.settings = JSON.parse(event.newValue)
          this.notifySubscribers()
        } catch (error) {
          console.error("Error handling storage event:", error)
        }
      }
    })
  }

  private notifySubscribers() {
    this.subscribers.forEach((subscriber) => {
      try {
        subscriber(this.settings)
      } catch (error) {
        console.error("Error notifying subscriber:", error)
      }
    })
  }

  // Public methods
  getSettings(): SiteSettings {
    return { ...this.settings }
  }

  updateSettings(newSettings: Partial<SiteSettings>): void {
    try {
      // Validate required fields
      if (newSettings.siteTitle && newSettings.siteTitle.length < 1) {
        throw new Error("Site title cannot be empty")
      }

      if (newSettings.whatsappLink && !newSettings.whatsappLink.startsWith("https://wa.me/")) {
        throw new Error("Invalid WhatsApp link format")
      }

      // Merge and save settings
      this.settings = {
        ...this.settings,
        ...newSettings,
        updatedAt: new Date().toISOString(),
      }

      this.saveSettings(this.settings)
      toast.success("Settings updated successfully")
    } catch (error) {
      console.error("Error updating settings:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update settings")
      throw error
    }
  }

  subscribe(callback: SettingsSubscriber): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  restoreDefaults(): void {
    try {
      const defaults = this.getDefaultSettings()
      this.settings = defaults
      this.saveSettings(defaults)
      toast.success("Settings restored to defaults")
    } catch (error) {
      console.error("Error restoring defaults:", error)
      toast.error("Failed to restore default settings")
      throw error
    }
  }

  restoreFromBackup(): boolean {
    try {
      const backup = localStorage.getItem(this.BACKUP_KEY)
      if (backup) {
        this.settings = JSON.parse(backup)
        this.saveSettings(this.settings)
        return true
      }
      return false
    } catch (error) {
      console.error("Error restoring from backup:", error)
      return false
    }
  }

  getSettingsHistory(): Array<{ timestamp: string; settings: SiteSettings }> {
    if (typeof window === "undefined") return []

    try {
      const history = localStorage.getItem(this.HISTORY_KEY)
      return history ? JSON.parse(history) : []
    } catch (error) {
      console.error("Error loading settings history:", error)
      return []
    }
  }

  isBusinessOpen(): boolean {
    const now = new Date()
    const [openHour, openMinute] = this.settings.businessHours.open.split(":").map(Number)
    const [closeHour, closeMinute] = this.settings.businessHours.close.split(":").map(Number)

    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    const currentTime = currentHour * 60 + currentMinute
    const openTime = openHour * 60 + openMinute
    const closeTime = closeHour * 60 + closeMinute

    return currentTime >= openTime && currentTime <= closeTime
  }

  formatWhatsAppMessage(items: Array<{ name: string; quantity: number; price: number }>, total: number): string {
    const template = this.settings.orderTemplate

    const itemsList = items.map((item) => `${item.quantity}x ${item.name} @ ${item.price}`).join("\n")

    return template.replace("{items}", itemsList).replace("{total}", total.toString())
  }
}

export const settingsService = SiteSettingsManager.getInstance()

