"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "./ImageUpload"
import { usePromotions, type Promotion } from "@/app/contexts/PromotionContext"
import { toast } from "sonner"

interface PromotionFormProps {
  promotion?: Promotion
  onSubmit: () => void
}

export function PromotionForm({ promotion, onSubmit }: PromotionFormProps) {
  const { addPromotion, updatePromotion } = usePromotions()
  const [formData, setFormData] = useState({
    title: promotion?.title || "",
    description: promotion?.description || "",
    imageUrl: promotion?.imageUrl || "",
    startDate: promotion?.startDate || new Date().toISOString().split("T")[0],
    endDate: promotion?.endDate || new Date().toISOString().split("T")[0],
    discountPercentage: promotion?.discountPercentage || 0,
    type: promotion?.type || "BANNER",
    status: promotion?.status || "SCHEDULED",
    targetGender: promotion?.targetGender || "ALL",
    targetCategory: promotion?.targetCategory || "ALL",
    conditions: promotion?.conditions || "",
    priority: promotion?.priority || 1,
    displayType: promotion?.displayType || "POPUP",
    displayDuration: promotion?.displayDuration || 0,
    dismissible: promotion?.dismissible ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (promotion) {
        updatePromotion(promotion.id, formData)
      } else {
        addPromotion(formData)
      }
      onSubmit()
    } catch (error) {
      toast.error("Error saving promotion")
      console.error("Error saving promotion:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label>Discount Percentage</Label>
            <Input
              type="number"
              min="0"
              max="100"
              required
              value={formData.discountPercentage}
              onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
            />
          </div>

          <div>
            <Label>Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "BANNER" | "SALE" | "SPECIAL_OFFER") => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BANNER">Banner</SelectItem>
                <SelectItem value="SALE">Sale</SelectItem>
                <SelectItem value="SPECIAL_OFFER">Special Offer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Display Type</Label>
            <Select
              value={formData.displayType}
              onValueChange={(value: "POPUP" | "HERO" | "SIDEBAR") => setFormData({ ...formData, displayType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select display type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POPUP">Popup</SelectItem>
                <SelectItem value="HERO">Hero Banner</SelectItem>
                <SelectItem value="SIDEBAR">Sidebar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "ACTIVE" | "SCHEDULED" | "EXPIRED") => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>

          <div>
            <Label>End Date</Label>
            <Input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <div>
            <Label>Target Gender</Label>
            <Select
              value={formData.targetGender}
              onValueChange={(value: "MAN" | "WOMAN" | "ALL") => setFormData({ ...formData, targetGender: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="MAN">Men</SelectItem>
                <SelectItem value="WOMAN">Women</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Target Category</Label>
            <Select
              value={formData.targetCategory}
              onValueChange={(value) => setFormData({ ...formData, targetCategory: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="BAJU">Baju</SelectItem>
                <SelectItem value="CELANA">Celana</SelectItem>
                <SelectItem value="SWETER">Sweter</SelectItem>
                <SelectItem value="HODDIE">Hoddie</SelectItem>
                <SelectItem value="JAM_TANGAN">Jam Tangan</SelectItem>
                <SelectItem value="PARFUM">Parfum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Priority (1-10)</Label>
            <Input
              type="number"
              min="1"
              max="10"
              required
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
            />
          </div>

          <div>
            <Label>Display Duration (seconds, 0 for no auto-dismiss)</Label>
            <Input
              type="number"
              min="0"
              value={formData.displayDuration}
              onChange={(e) => setFormData({ ...formData, displayDuration: Number(e.target.value) })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Allow Dismissal</Label>
            <Switch
              checked={formData.dismissible}
              onCheckedChange={(checked) => setFormData({ ...formData, dismissible: checked })}
            />
          </div>

          <div>
            <Label>Promotion Image</Label>
            <ImageUpload value={formData.imageUrl} onChange={(url) => setFormData({ ...formData, imageUrl: url })} />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onSubmit}>
          Cancel
        </Button>
        <Button type="submit">{promotion ? "Update Promotion" : "Add Promotion"}</Button>
      </div>
    </form>
  )
}

