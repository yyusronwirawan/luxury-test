"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Star, ShoppingCart, Heart, ChevronLeft, ChevronRight, DollarSign, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useProducts } from "@/app/contexts/ProductContext"
import { useCart } from "@/app/contexts/CartContext"
import { useWishlist } from "@/app/contexts/WishlistContext"
import { useCurrency } from "@/app/contexts/CurrencyContext"
import ProductCard from "@/app/components/ProductCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { cn } from "@/lib/utils"

// Define image loader function
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  // If src is already a full URL, return it
  if (src.startsWith("http")) {
    return src
  }
  // Otherwise, use placeholder
  return `/placeholder.svg?width=${width}&quality=${quality || 75}`
}

export default function ProductPage({ params }: { params: { gender: string; category: string; product: string } }) {
  const { products, incrementProductViews, getProductsByCategory } = useProducts()
  const { addItem: addToCart } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const { currency, setCurrency, convertPrice, formatPrice } = useCurrency()

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState("1")
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const productId = Number.parseInt(params.product)

  const product = products.find((p) => p.id === productId)
  const isWishlisted = product ? isInWishlist(product.id) : false

  // Handle image error
  const handleImageError = () => {
    setImageError(true)
    setIsImageLoading(false)
  }

  // Reset image states when selected image changes
  useEffect(() => {
    setIsImageLoading(true)
    setImageError(false)
  }, [selectedImage]) //Corrected dependency array

  useEffect(() => {
    if (product) {
      incrementProductViews(product.id)
    }
  }, [product, incrementProductViews])

  if (!product) {
    notFound()
  }

  // Ensure product has images array
  const productImages = product.images?.length > 0 ? product.images : [product.imageUrl || "/placeholder.svg"]

  const relatedProducts = getProductsByCategory(params.gender, params.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4)

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        priceIDR: product.priceIDR,
        imageUrl: product.imageUrl,
        category: product.category,
        gender: product.gender,
        quantity: Number.parseInt(quantity),
      })
    }
  }

  const handleWishlistToggle = () => {
    if (product) {
      if (isWishlisted) {
        removeFromWishlist(product.id)
      } else {
        addToWishlist({
          id: product.id,
          name: product.name,
          price: product.priceIDR,
          imageUrl: product.imageUrl,
          category: product.category,
          gender: product.gender,
          rating: product.rating,
        })
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div>
          <div className="relative mb-4">
            <AspectRatio ratio={1}>
              {isImageLoading && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <Skeleton className="w-full h-full" />
                </div>
              )}
              <Image
                loader={imageLoader}
                src={imageError ? "/placeholder.svg" : productImages[selectedImage]}
                alt={product.name}
                fill
                className={cn(
                  "object-cover rounded-lg transition-all duration-300",
                  isImageLoading ? "scale-105 blur-lg" : "scale-100 blur-0",
                )}
                onLoadingComplete={() => setIsImageLoading(false)}
                onError={handleImageError}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={90}
              />
            </AspectRatio>
            {productImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg rounded-full"
                  onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : productImages.length - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg rounded-full"
                  onClick={() => setSelectedImage((prev) => (prev < productImages.length - 1 ? prev + 1 : 0))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {productImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200",
                  selectedImage === index
                    ? "border-gold ring-2 ring-gold/20"
                    : "border-transparent hover:border-gold/50",
                )}
              >
                <Image
                  loader={imageLoader}
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 10vw"
                  quality={75}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "h-5 w-5 transition-colors",
                      index < product.rating ? "text-yellow-400 fill-current" : "text-gray-300",
                    )}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">({product.sales} sold)</span>
              </div>
            </div>

            {/* Currency and Price Section */}
            <div className="flex items-center gap-4 mb-6">
              <Select value={currency} onValueChange={(value: "IDR" | "USD" | "THB") => setCurrency(value)}>
                <SelectTrigger className="w-[150px]">
                  <div className="flex items-center gap-2">
                    {currency === "USD" ? <DollarSign className="h-4 w-4" /> : <Coins className="h-4 w-4" />}
                    <SelectValue placeholder="Currency" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR" className="flex items-center gap-2">
                    <Coins className="h-4 w-4 mr-2" />
                    IDR
                  </SelectItem>
                  <SelectItem value="USD" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 mr-2" />
                    USD
                  </SelectItem>
                  <SelectItem value="THB" className="flex items-center gap-2">
                    <Coins className="h-4 w-4 mr-2" />
                    THB
                  </SelectItem>
                </SelectContent>
              </Select>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currency}-${product.priceIDR}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-3xl font-bold text-gold">{formatPrice(convertPrice(product.priceIDR))}</span>
                  {product.originalPriceIDR && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(convertPrice(product.originalPriceIDR))}
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Status Badge */}
            <div className="mb-6">
              <Badge variant={product.status === "IN_STOCK" ? "default" : "secondary"} className="text-sm">
                {product.status === "IN_STOCK" ? "In Stock" : product.status === "SOLD" ? "Sold Out" : "Pre-Order"}
              </Badge>
              <p className="text-sm text-gray-500 mt-2">{product.stock} items available</p>
            </div>

            {/* Discount Banner */}
            {product.discount && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-100 p-4 rounded-lg mb-6"
              >
                <p className="text-red-600 font-medium flex items-center gap-2">
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">Save {product.discount}%</span>
                  Limited Time Offer!
                </p>
              </motion.div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <Select value={quantity} onValueChange={setQuantity}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: Math.min(10, product.stock) }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={product.status === "SOLD" || product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.status === "SOLD"
                    ? "Sold Out"
                    : product.status === "PRE_ORDER"
                      ? "Pre-Order"
                      : product.stock === 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={cn("flex-1", isWishlisted && "border-red-200 bg-red-50 hover:bg-red-100")}
                  onClick={handleWishlistToggle}
                >
                  <Heart
                    className={cn("mr-2 h-5 w-5 transition-colors", isWishlisted && "fill-red-500 text-red-500")}
                  />
                  {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                </Button>
              </div>
            </div>

            {/* Product Description */}
            <div className="mt-8">
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="mb-16">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="details">Product Details</TabsTrigger>
          <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="prose max-w-none">
          <p>{product.description}</p>
        </TabsContent>
        <TabsContent value="details">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4 p-4 border-b">
              <span className="font-medium">Category</span>
              <span>{product.category}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 border-b">
              <span className="font-medium">Gender</span>
              <span>{product.gender}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 border-b">
              <span className="font-medium">Stock</span>
              <span>{product.stock} items</span>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 border-b">
              <span className="font-medium">Rating</span>
              <span>{product.rating} / 5</span>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="shipping">
          <div className="prose max-w-none">
            <h3>Shipping Information</h3>
            <p>Free shipping on orders over {formatPrice(convertPrice(1000000))}</p>
            <p>Estimated delivery time: 3-5 business days</p>

            <h3 className="mt-6">Returns Policy</h3>
            <p>30-day return policy for unworn items</p>
            <p>Please keep original packaging for returns</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {relatedProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </div>
  )
}

