"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "./ImageUpload"
import { useProducts, type Product } from "@/app/contexts/ProductContext"
import { toast } from "sonner"

interface ProductFormProps {
  product?: Product
  onSubmit: () => void
}

export function ProductForm({ product, onSubmit }: ProductFormProps) {
  const { addProduct, updateProduct } = useProducts()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: product?.name || "",
    price: product?.price?.toString() || "",
    priceIDR: product?.priceIDR?.toString() || "",
    originalPrice: product?.originalPrice?.toString() || "",
    description: product?.description || "",
    imageUrl: product?.imageUrl || "",
    category: product?.category || "",
    gender: product?.gender || "",
    stock: product?.stock?.toString() || "0",
    isNew: product?.isNew || false,
    isSale: product?.isSale || false,
    isBestSeller: product?.isBestSeller || false,
    discount: product?.discount?.toString() || "0",
    images: product?.images || [],
    rating: product?.rating?.toString() || "0",
    status: product?.status || "IN_STOCK",
    sales: product?.sales?.toString() || "0",
  })

  const validateForm = () => {
    if (!formData.name) {
      toast.error("Product name is required")
      return false
    }
    if (!formData.price || isNaN(Number(formData.price))) {
      toast.error("Valid price is required")
      return false
    }
    if (!formData.category) {
      toast.error("Category is required")
      return false
    }
    if (!formData.gender) {
      toast.error("Gender is required")
      return false
    }
    if (!formData.description) {
      toast.error("Description is required")
      return false
    }
    return true
  }

  const prepareProductData = () => {
    const now = new Date().toISOString()
    const baseProduct = {
      name: formData.name,
      price: Number(formData.price),
      priceIDR: Number(formData.price), // Use the same price for IDR if not specified
      description: formData.description,
      imageUrl: formData.imageUrl || "/placeholder.svg",
      category: formData.category,
      gender: formData.gender as "MAN" | "WOMAN",
      rating: Number(formData.rating),
      isNew: formData.isNew,
      isSale: formData.isSale,
      isBestSeller: formData.isBestSeller,
      stock: Number(formData.stock),
      images: formData.images,
      sales: Number(formData.sales),
      status: formData.status as "ACTIVE" | "DRAFT" | "ARCHIVED" | "SOLD" | "IN_STOCK" | "PRE_ORDER",
      dateAdded: product?.dateAdded || now,
      createdAt: product?.createdAt || now,
      updatedAt: now,
    }

    if (formData.isSale) {
      return {
        ...baseProduct,
        discount: Number(formData.discount),
        originalPrice: Number(formData.originalPrice),
      }
    }

    return baseProduct
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      // Validate form
      if (!validateForm()) {
        return
      }

      // Prepare product data
      const productData = prepareProductData()
      console.log("Submitting product data:", productData)

      if (product) {
        // Update existing product
        await updateProduct(product.id, productData)
        toast.success("Product updated successfully")
      } else {
        // Add new product
        await addProduct(productData)
        toast.success("Product added successfully")
      }

      onSubmit()
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save product")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label>Product Name</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
            />
          </div>

          <div>
            <Label>Price (IDR)</Label>
            <Input
              type="number"
              step="1000"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g. 299000"
            />
          </div>

          <div>
            <Label>Original Price (for sale items)</Label>
            <Input
              type="number"
              step="1000"
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
              placeholder="e.g. 399000"
              disabled={!formData.isSale}
            />
          </div>

          <div>
            <Label>Stock</Label>
            <Input
              type="number"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              min="0"
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BAJU">BAJU</SelectItem>
                <SelectItem value="CELANA">CELANA</SelectItem>
                <SelectItem value="SWETER">SWETER</SelectItem>
                <SelectItem value="HODDIE">HODDIE</SelectItem>
                <SelectItem value="JAM TANGAN">JAM TANGAN</SelectItem>
                <SelectItem value="PARFUM">PARFUM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value as "MAN" | "WOMAN" })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MAN">MAN</SelectItem>
                <SelectItem value="WOMAN">WOMAN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "ACTIVE" | "DRAFT" | "ARCHIVED" | "SOLD" | "IN_STOCK" | "PRE_ORDER") =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN_STOCK">In Stock</SelectItem>
                <SelectItem value="SOLD">Sold</SelectItem>
                <SelectItem value="PRE_ORDER">Pre-Order</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
              placeholder="Enter product description"
            />
          </div>

          <div>
            <Label>Product Image</Label>
            <ImageUpload value={formData.imageUrl} onChange={(url) => setFormData({ ...formData, imageUrl: url })} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Mark as New</Label>
              <Switch
                checked={formData.isNew}
                onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Mark as Sale</Label>
              <Switch
                checked={formData.isSale}
                onCheckedChange={(checked) => {
                  setFormData({
                    ...formData,
                    isSale: checked,
                    discount: checked ? formData.discount : "0",
                    originalPrice: checked ? formData.originalPrice : "",
                  })
                }}
              />
            </div>

            {formData.isSale && (
              <div>
                <Label>Discount Percentage</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label>Mark as Best Seller</Label>
              <Switch
                checked={formData.isBestSeller}
                onCheckedChange={(checked) => setFormData({ ...formData, isBestSeller: checked })}
              />
            </div>
          </div>

          <div>
            <Label>Rating</Label>
            <Select value={formData.rating} onValueChange={(value) => setFormData({ ...formData, rating: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5].map((rating) => (
                  <SelectItem key={rating} value={rating.toString()}>
                    {rating} {rating === 1 ? "Star" : "Stars"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Sales Count</Label>
            <Input
              type="number"
              min="0"
              value={formData.sales}
              onChange={(e) => setFormData({ ...formData, sales: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onSubmit}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : product ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </form>
  )
}

