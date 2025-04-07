"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Package,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  BarChart2,
  PieChartIcon,
  LineChartIcon,
  Users,
  Eye,
  Star,
  ArrowUp,
  ArrowDown,
  Activity,
  Settings,
  Clock,
  Undo,
  Save,
} from "lucide-react"
import { useProducts } from "@/app/contexts/ProductContext"
import { analyticsService } from "@/app/services/analytics"
import { LineChart, BarChart, PieChart } from "./components/Charts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "./components/DateRangePicker"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { QuickAccess } from "./components/QuickAccess"
import { settingsService } from "@/app/services/settingsService"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { TimePickerInput } from "@/components/ui/time-picker"
import { toast } from "sonner"
import Image from "next/image"
import type React from "react" // Added import for React

export default function AdminDashboard() {
  const { products } = useProducts()
  const [timeRange, setTimeRange] = useState("7d")
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  })
  const [settings, setSettings] = useState(settingsService.getSettings())
  const [previewLogo, setPreviewLogo] = useState(settings.logoUrl)
  const [previewFavicon, setPreviewFavicon] = useState(settings.faviconUrl)
  const [scheduledChanges, setScheduledChanges] = useState<{ date: Date; changes: Partial<typeof settings> } | null>(
    null,
  )
  const [settingsHistory, setSettingsHistory] = useState<{ date: Date; settings: typeof settings }[]>([])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon") => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          if (type === "logo") {
            setPreviewLogo(reader.result)
          } else {
            setPreviewFavicon(reader.result)
          }
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveSettings = () => {
    const updatedSettings = { ...settings, logoUrl: previewLogo, faviconUrl: previewFavicon }
    settingsService.updateSettings(updatedSettings)
    setSettingsHistory((prev) => [{ date: new Date(), settings: updatedSettings }, ...prev])
    toast.success("Settings updated successfully")
  }

  const handleScheduleChanges = () => {
    const scheduledDate = new Date()
    scheduledDate.setHours(scheduledDate.getHours() + 1)
    setScheduledChanges({ date: scheduledDate, changes: settings })
    toast.success(`Changes scheduled for ${scheduledDate.toLocaleString()}`)
  }

  const handleRestoreSettings = (historySetting: typeof settings) => {
    setSettings(historySetting)
    setPreviewLogo(historySetting.logoUrl)
    setPreviewFavicon(historySetting.faviconUrl)
    toast.success("Settings restored from history")
  }

  const handleBackupSettings = () => {
    const backupData = JSON.stringify(settings)
    const blob = new Blob([backupData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `settings_backup_${new Date().toISOString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Settings backup created")
  }

  const handleRestoreFromBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const restoredSettings = JSON.parse(event.target?.result as string)
          setSettings(restoredSettings)
          setPreviewLogo(restoredSettings.logoUrl)
          setPreviewFavicon(restoredSettings.faviconUrl)
          toast.success("Settings restored from backup")
        } catch (error) {
          toast.error("Error restoring settings from backup")
        }
      }
      reader.readAsText(file)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-[300px]" />
        </div>
        <div className="grid grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  // Calculate metrics
  const totalRevenue = products.reduce((sum, product) => sum + product.price * product.sales, 0)
  const totalOrders = products.reduce((sum, product) => sum + product.sales, 0)
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const lowStockCount = products.filter((p) => p.stock <= 5).length
  const outOfStockCount = products.filter((p) => p.stock === 0).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangePicker from={dateRange.from} to={dateRange.to} onSelect={setDateRange} />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowUp className="h-4 w-4 mr-1 text-green-500" />
              12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="text-xs text-muted-foreground mt-1">Avg. Value: ${averageOrderValue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inventory Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockCount + outOfStockCount}</div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-xs">
                <span className="text-muted-foreground">Low Stock: </span>
                <span className="font-medium text-yellow-600">{lowStockCount}</span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Out of Stock: </span>
                <span className="font-medium text-red-600">{outOfStockCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Products</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((p) => p.isBestSeller).length}</div>
            <div className="text-xs text-muted-foreground mt-1">Best selling items this month</div>
          </CardContent>
        </Card>
      </div>

      <QuickAccess />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input id="siteTitle" name="siteTitle" value={settings.siteTitle} onChange={handleSettingsChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={settings.metaDescription}
                  onChange={handleSettingsChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="heroTitle">Hero Title</Label>
                <Input id="heroTitle" name="heroTitle" value={settings.heroTitle} onChange={handleSettingsChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                <Input
                  id="heroSubtitle"
                  name="heroSubtitle"
                  value={settings.heroSubtitle}
                  onChange={handleSettingsChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="logo">Logo</Label>
                <div className="flex items-center space-x-4">
                  <Image
                    src={previewLogo || "/placeholder.svg"}
                    alt="Logo"
                    width={100}
                    height={100}
                    className="object-contain"
                  />
                  <Input id="logo" type="file" accept="image/*" onChange={(e) => handleFileChange(e, "logo")} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="favicon">Favicon</Label>
                <div className="flex items-center space-x-4">
                  <Image
                    src={previewFavicon || "/placeholder.svg"}
                    alt="Favicon"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                  <Input
                    id="favicon"
                    type="file"
                    accept="image/x-icon,image/png"
                    onChange={(e) => handleFileChange(e, "favicon")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="whatsappLink">WhatsApp Link</Label>
                <Input
                  id="whatsappLink"
                  name="whatsappLink"
                  value={settings.whatsappLink}
                  onChange={handleSettingsChange}
                />
              </div>
              <div className="grid gap-2">
                <Label>Business Hours</Label>
                <div className="flex space-x-4">
                  <div>
                    <Label htmlFor="openTime">Opening Time</Label>
                    <TimePickerInput
                      value={settings.businessHours?.open}
                      onChange={(value) =>
                        setSettings((prev) => ({ ...prev, businessHours: { ...prev.businessHours, open: value } }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="closeTime">Closing Time</Label>
                    <TimePickerInput
                      value={settings.businessHours?.close}
                      onChange={(value) =>
                        setSettings((prev) => ({ ...prev, businessHours: { ...prev.businessHours, close: value } }))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.businessHours?.timezone}
                  onValueChange={(value) =>
                    setSettings((prev) => ({ ...prev, businessHours: { ...prev.businessHours, timezone: value } }))
                  }
                >
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                    <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                    <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="orderTemplate">Order Message Template</Label>
                <Textarea
                  id="orderTemplate"
                  name="orderTemplate"
                  value={settings.orderTemplate}
                  onChange={handleSettingsChange}
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customCss">Custom CSS</Label>
                <Textarea
                  id="customCss"
                  name="customCss"
                  value={settings.customCss}
                  onChange={handleSettingsChange}
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <div>
          <Button onClick={handleBackupSettings} className="mr-2">
            Backup Settings
          </Button>
          <Button variant="outline" className="mr-2">
            <label htmlFor="restoreBackup" className="cursor-pointer">
              Restore from Backup
            </label>
          </Button>
          <input id="restoreBackup" type="file" accept=".json" className="hidden" onChange={handleRestoreFromBackup} />
        </div>
        <div>
          <Button onClick={handleScheduleChanges} variant="outline" className="mr-2">
            <Clock className="w-4 h-4 mr-2" />
            Schedule Changes
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings History */}
      <Card>
        <CardHeader>
          <CardTitle>Settings History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settingsHistory.map((history, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{history.date.toLocaleString()}</span>
                <Button onClick={() => handleRestoreSettings(history.settings)} variant="outline">
                  <Undo className="w-4 h-4 mr-2" />
                  Restore
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Image
                src={previewLogo || "/placeholder.svg"}
                alt="Logo Preview"
                width={100}
                height={100}
                className="object-contain"
              />
              <Image
                src={previewFavicon || "/placeholder.svg"}
                alt="Favicon Preview"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold">{settings.siteTitle}</h1>
            <p>{settings.metaDescription}</p>
            <div>
              <h2 className="text-xl font-semibold">{settings.heroTitle}</h2>
              <p>{settings.heroSubtitle}</p>
            </div>
            <div>
              <p>
                Business Hours: {settings.businessHours?.open} - {settings.businessHours?.close} (
                {settings.businessHours?.timezone})
              </p>
              <p>WhatsApp: {settings.whatsappLink}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Changes */}
      {scheduledChanges && (
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Changes scheduled for: {scheduledChanges.date.toLocaleString()}</p>
            <Button onClick={() => setScheduledChanges(null)} variant="outline">
              Cancel Scheduled Changes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue Overview</CardTitle>
              <LineChartIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="revenue">
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>
              <TabsContent value="revenue">
                <LineChart
                  data={[
                    { name: "Mon", value: 400 },
                    { name: "Tue", value: 300 },
                    { name: "Wed", value: 500 },
                    { name: "Thu", value: 350 },
                    { name: "Fri", value: 600 },
                    { name: "Sat", value: 450 },
                    { name: "Sun", value: 400 },
                  ]}
                />
              </TabsContent>
              <TabsContent value="orders">
                <LineChart
                  data={[
                    { name: "Mon", value: 12 },
                    { name: "Tue", value: 8 },
                    { name: "Wed", value: 15 },
                    { name: "Thu", value: 10 },
                    { name: "Fri", value: 18 },
                    { name: "Sat", value: 14 },
                    { name: "Sun", value: 11 },
                  ]}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Category Performance</CardTitle>
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <PieChart
              data={[
                { name: "BAJU", value: 400 },
                { name: "CELANA", value: 300 },
                { name: "SWETER", value: 200 },
                { name: "HODDIE", value: 250 },
                { name: "JAM TANGAN", value: 150 },
                { name: "PARFUM", value: 180 },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Real-time Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: "Just now", action: "New order received for Classic White T-Shirt" },
              { time: "2m ago", action: "Stock update: Designer Black Dress (3 units added)" },
              { time: "5m ago", action: "New customer registration" },
              { time: "10m ago", action: "Product review received (4 stars)" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4">
                <Badge variant="outline" className="w-24">
                  {activity.time}
                </Badge>
                <span>{activity.action}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

