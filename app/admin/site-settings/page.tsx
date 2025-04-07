"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  Loader2,
  Save,
  Undo,
  Clock,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  PhoneIcon as WhatsappIcon,
  ImageIcon,
  FileCode,
  AlertTriangle,
  MessageCircle,
  Phone,
} from "lucide-react"
import Image from "next/image"
import { settingsService } from "@/app/services/settingsService"
import { Switch } from "@/components/ui/switch"
import { TimePickerInput } from "@/components/ui/time-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState(settingsService.getSettings())
  const [isLoading, setIsLoading] = useState(false)
  const [previewLogo, setPreviewLogo] = useState(settings.logoUrl)
  const [previewFavicon, setPreviewFavicon] = useState(settings.faviconUrl)
  const [activeTab, setActiveTab] = useState("general")
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  useEffect(() => {
    const unsubscribe = settingsService.subscribe((newSettings) => {
      setSettings(newSettings)
      setPreviewLogo(newSettings.logoUrl)
      setPreviewFavicon(newSettings.faviconUrl)
    })

    return () => unsubscribe()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon") => {
    const file = e.target.files?.[0]
    if (file) {
      try {
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
      } catch (error) {
        toast.error(`Failed to load ${type} image`)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await settingsService.updateSettings({
        ...settings,
        logoUrl: previewLogo,
        faviconUrl: previewFavicon,
      })
      toast.success("Settings updated successfully")
    } catch (error) {
      console.error("Error updating settings:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestoreDefaults = async () => {
    if (window.confirm("Are you sure you want to restore default settings?")) {
      try {
        setIsLoading(true)
        await settingsService.restoreDefaults()
        toast.success("Settings restored to defaults")
      } catch (error) {
        toast.error("Failed to restore default settings")
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">Manage your website's global settings and configuration</p>
        </div>
        <div className="flex items-center gap-4">
          <Switch checked={isPreviewMode} onCheckedChange={setIsPreviewMode} id="preview-mode" />
          <Label htmlFor="preview-mode">Preview Mode</Label>
        </div>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic website configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteTitle">Site Title</Label>
                  <Input
                    id="siteTitle"
                    name="siteTitle"
                    value={settings.siteTitle}
                    onChange={handleInputChange}
                    placeholder="My Awesome Store"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={settings.metaDescription}
                    onChange={handleInputChange}
                    placeholder="Enter your site's meta description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Hero Title</Label>
                  <Input
                    id="heroTitle"
                    name="heroTitle"
                    value={settings.heroTitle}
                    onChange={handleInputChange}
                    placeholder="Main heading on homepage"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                  <Input
                    id="heroSubtitle"
                    name="heroSubtitle"
                    value={settings.heroSubtitle}
                    onChange={handleInputChange}
                    placeholder="Subtitle text on homepage"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>Logo, favicon, and visual identity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo</Label>
                  <div className="flex items-center space-x-4">
                    <div className="relative w-[200px] h-[80px] border rounded-lg overflow-hidden">
                      <Image src={previewLogo || "/placeholder.svg"} alt="Site Logo" fill className="object-contain" />
                    </div>
                    <Input id="logo" type="file" accept="image/*" onChange={(e) => handleFileChange(e, "logo")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="favicon">Favicon</Label>
                  <div className="flex items-center space-x-4">
                    <div className="relative w-[32px] h-[32px] border rounded-lg overflow-hidden">
                      <Image src={previewFavicon || "/placeholder.svg"} alt="Favicon" fill className="object-cover" />
                    </div>
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
                <CardDescription>WhatsApp and business hours configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="whatsappLink">WhatsApp Order Link</Label>
                  <div className="relative">
                    <WhatsappIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="whatsappLink"
                      name="whatsappLink"
                      value={settings.whatsappLink}
                      onChange={handleInputChange}
                      placeholder="https://wa.me/1234567890"
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Format: https://wa.me/[your number] (without + or spaces)
                  </p>
                </div>

                <div className="space-y-4">
                  <Label>Business Hours</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="openTime">Opening Time</Label>
                      <TimePickerInput
                        value={settings.businessHours?.open}
                        onChange={(value) =>
                          setSettings((prev) => ({
                            ...prev,
                            businessHours: { ...prev.businessHours, open: value },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="closeTime">Closing Time</Label>
                      <TimePickerInput
                        value={settings.businessHours?.close}
                        onChange={(value) =>
                          setSettings((prev) => ({
                            ...prev,
                            businessHours: { ...prev.businessHours, close: value },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.businessHours?.timezone}
                      onValueChange={(value) =>
                        setSettings((prev) => ({
                          ...prev,
                          businessHours: { ...prev.businessHours, timezone: value },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                        <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                        <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Configure your social media profile links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <div className="relative">
                      <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="facebook"
                        name="socialLinks.facebook"
                        value={settings.socialLinks?.facebook}
                        onChange={(e) => {
                          setSettings((prev) => ({
                            ...prev,
                            socialLinks: {
                              ...prev.socialLinks,
                              facebook: e.target.value,
                            },
                          }))
                        }}
                        placeholder="https://facebook.com/yourusername"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="instagram"
                        name="socialLinks.instagram"
                        value={settings.socialLinks?.instagram}
                        onChange={(e) => {
                          setSettings((prev) => ({
                            ...prev,
                            socialLinks: {
                              ...prev.socialLinks,
                              instagram: e.target.value,
                            },
                          }))
                        }}
                        placeholder="https://instagram.com/yourusername"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="telegram">Telegram</Label>
                    <div className="relative">
                      <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="telegram"
                        name="socialLinks.telegram"
                        value={settings.socialLinks?.telegram}
                        onChange={(e) => {
                          setSettings((prev) => ({
                            ...prev,
                            socialLinks: {
                              ...prev.socialLinks,
                              telegram: e.target.value,
                            },
                          }))
                        }}
                        placeholder="https://t.me/yourusername"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="whatsapp"
                        name="socialLinks.whatsapp"
                        value={settings.socialLinks?.whatsapp}
                        onChange={(e) => {
                          setSettings((prev) => ({
                            ...prev,
                            socialLinks: {
                              ...prev.socialLinks,
                              whatsapp: e.target.value,
                            },
                          }))
                        }}
                        placeholder="https://wa.me/yournumber"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Format: https://wa.me/[your number] (without + or spaces)
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Preview</h4>
                  <div className="flex gap-4">
                    <Link
                      href={settings.socialLinks?.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Facebook className="w-5 h-5" />
                    </Link>
                    <Link
                      href={settings.socialLinks?.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Instagram className="w-5 h-5" />
                    </Link>
                    <Link
                      href={settings.socialLinks?.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </Link>
                    <Link
                      href={settings.socialLinks?.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Phone className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Custom CSS and order message template</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="orderTemplate">Order Message Template</Label>
                  <Textarea
                    id="orderTemplate"
                    name="orderTemplate"
                    value={settings.orderTemplate}
                    onChange={handleInputChange}
                    placeholder="Hello! I would like to order: {items} Total: {total}"
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    Use {"{items}"} for product list and {"{total}"} for order total
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customCss">Custom CSS</Label>
                  <Textarea
                    id="customCss"
                    name="customCss"
                    value={settings.customCss}
                    onChange={handleInputChange}
                    placeholder="Enter custom CSS rules"
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>

                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Modifying custom CSS can affect your site's appearance. Use with caution.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-between mt-6">
            <Button type="button" variant="outline" onClick={handleRestoreDefaults}>
              <Undo className="mr-2 h-4 w-4" />
              Restore Defaults
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Tabs>

      {isPreviewMode && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>See how your settings will look</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Image
                  src={previewLogo || "/placeholder.svg"}
                  alt="Logo Preview"
                  width={200}
                  height={80}
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
              <div>
                <h2 className="font-bold">{settings.siteTitle}</h2>
                <p className="text-sm text-muted-foreground">{settings.metaDescription}</p>
              </div>
              <div>
                <p className="text-sm">
                  <strong>Business Hours:</strong> {settings.businessHours?.open} - {settings.businessHours?.close} (
                  {settings.businessHours?.timezone})
                </p>
                <p className="text-sm">
                  <strong>WhatsApp:</strong> {settings.whatsappLink}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

