"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Heart, Loader2, ShoppingCart, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/app/contexts/CartContext"
import { useWishlist } from "@/app/contexts/WishlistContext"
import { useCurrency } from "@/app/contexts/CurrencyContext"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Product } from "@/app/types/product"

interface ProductCardProps extends Product {
  className?: string
  viewMode?: "grid" | "list"
  onQuickView?: () => void
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  priceIDR,
  imageUrl,
  category,
  gender,
  rating,
  isNew,
  isSale,
  isBestSeller,
  originalPriceIDR,
  discount,
  stock,
  sales,
  status,
  className,
  viewMode = "grid",
  onQuickView,
}) => {
  const { addItem: addToCart } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const { convertPrice, formatPrice, currency } = useCurrency()
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const isWishlisted = isInWishlist(id)

  const handleWishlistToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      if (isWishlisted) {
        removeFromWishlist(id)
      } else {
        addToWishlist({
          id,
          name,
          price: priceIDR,
          imageUrl,
          category,
          gender,
          rating,
        })
      }
    },
    [id, name, priceIDR, imageUrl, category, gender, rating, isWishlisted, addToWishlist, removeFromWishlist],
  )

  const handleAddToCart = useCallback(async () => {
    setIsAddingToCart(true)
    try {
      await addToCart({
        id,
        name,
        priceIDR,
        imageUrl,
        category,
        gender,
      })
    } finally {
      setIsAddingToCart(false)
    }
  }, [id, name, priceIDR, imageUrl, category, gender, addToCart])

  const renderStars = useCallback(
    () => (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
          <motion.div key={index} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: index * 0.1 }}>
            <Star
              className={cn(
                "h-4 w-4 transition-colors",
                index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
              )}
            />
          </motion.div>
        ))}
        {sales !== undefined && (
          <span className="ml-2 text-sm text-muted-foreground">
            {typeof sales === "number" && !isNaN(sales) ? `${sales} sold` : "0 sold"}
          </span>
        )}
      </div>
    ),
    [rating, sales],
  )

  const CardContent = () => (
    <>
      <div className="relative">
        <AspectRatio ratio={1}>
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={cn(
              "object-cover transition-all duration-700",
              isImageLoading ? "scale-110 blur-lg" : "scale-100 blur-0",
              "group-hover:scale-110",
            )}
            onLoadingComplete={() => setIsImageLoading(false)}
            priority
          />
        </AspectRatio>
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          <AnimatePresence>
            {isNew && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Badge variant="default">New</Badge>
              </motion.div>
            )}
            {isSale && discount && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Badge variant="destructive">-{discount}%</Badge>
              </motion.div>
            )}
            {isBestSeller && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Badge variant="secondary">Best Seller</Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className={cn(
                  "absolute top-2 right-2 transition-all duration-200",
                  isWishlisted ? "opacity-100 bg-red-50" : "opacity-0 group-hover:opacity-100",
                )}
                onClick={handleWishlistToggle}
              >
                <motion.div whileTap={{ scale: 0.8 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                  <Heart className={cn("h-5 w-5 transition-colors", isWishlisted && "fill-red-500 text-red-500")} />
                </motion.div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isWishlisted ? "Remove from wishlist" : "Add to wishlist"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-1 group-hover:text-gold transition-colors line-clamp-2">{name}</h3>
        <div className="mb-2">{renderStars()}</div>
        <div className="flex items-center gap-2">
          <motion.p
            className="text-lg font-bold text-gold"
            key={`${currency}-${priceIDR}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {formatPrice(convertPrice(priceIDR))}
          </motion.p>
          {originalPriceIDR && (
            <motion.p
              className="text-sm text-gray-500 line-through"
              key={`${currency}-${originalPriceIDR}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.4 }}
            >
              {formatPrice(convertPrice(originalPriceIDR))}
            </motion.p>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            className={cn(
              "flex-1 transition-all duration-300",
              status === "SOLD" || stock === 0 ? "bg-gray-200 text-gray-500" : "bg-black hover:bg-gray-800 text-white",
            )}
            onClick={handleAddToCart}
            disabled={status === "SOLD" || stock === 0 || isAddingToCart}
          >
            {isAddingToCart ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                {status === "SOLD"
                  ? "Sold Out"
                  : status === "PRE_ORDER"
                    ? "Pre-Order"
                    : stock === 0
                      ? "Out of Stock"
                      : "Add to Cart"}
              </>
            )}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" onClick={onQuickView}>
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{name}</DialogTitle>
                <DialogDescription>Quick view of the product details</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative aspect-square">
                  <Image src={imageUrl || "/placeholder.svg"} alt={name} fill className="object-cover rounded-lg" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gold mb-2">{formatPrice(convertPrice(priceIDR))}</p>
                  <p className="text-sm text-gray-500 mb-4">{category}</p>
                  <div className="mb-4">{renderStars()}</div>
                  <p className="text-sm mb-4">{status === "IN_STOCK" ? `${stock} in stock` : status}</p>
                  <Button onClick={handleAddToCart} disabled={status === "SOLD" || stock === 0 || isAddingToCart}>
                    {isAddingToCart ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  )

  if (viewMode === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn("flex items-center gap-4 bg-white rounded-lg shadow-md overflow-hidden", className)}
      >
        <div className="w-1/3">
          <AspectRatio ratio={1}>
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </AspectRatio>
        </div>
        <div className="flex-1 p-4">
          <h3 className="font-semibold mb-1 group-hover:text-gold transition-colors">{name}</h3>
          <div className="mb-2">{renderStars()}</div>
          <div className="flex items-center gap-2 mb-4">
            <p className="text-lg font-bold text-gold">{formatPrice(convertPrice(priceIDR))}</p>
            {originalPriceIDR && (
              <p className="text-sm text-gray-500 line-through">{formatPrice(convertPrice(originalPriceIDR))}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              className={cn(
                "flex-1 transition-all duration-300",
                status === "SOLD" || stock === 0
                  ? "bg-gray-200 text-gray-500"
                  : "bg-black hover:bg-gray-800 text-white",
              )}
              onClick={handleAddToCart}
              disabled={status === "SOLD" || stock === 0 || isAddingToCart}
            >
              {isAddingToCart ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {status === "SOLD"
                    ? "Sold Out"
                    : status === "PRE_ORDER"
                      ? "Pre-Order"
                      : stock === 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                </>
              )}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" onClick={onQuickView}>
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{name}</DialogTitle>
                  <DialogDescription>Quick view of the product details</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative aspect-square">
                    <Image src={imageUrl || "/placeholder.svg"} alt={name} fill className="object-cover rounded-lg" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gold mb-2">{formatPrice(convertPrice(priceIDR))}</p>
                    <p className="text-sm text-gray-500 mb-4">{category}</p>
                    <div className="mb-4">{renderStars()}</div>
                    <p className="text-sm mb-4">{status === "IN_STOCK" ? `${stock} in stock` : status}</p>
                    <Button onClick={handleAddToCart} disabled={status === "SOLD" || stock === 0 || isAddingToCart}>
                      {isAddingToCart ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "group bg-white rounded-lg shadow-lg overflow-hidden transform-gpu transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        className,
      )}
    >
      <Link href={`/shop/${gender.toLowerCase()}/${category.toLowerCase()}/${id}`}>
        <CardContent />
      </Link>
    </motion.div>
  )
}

export default ProductCard

