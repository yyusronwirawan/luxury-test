"use client"

import { useWishlist } from "@/app/contexts/WishlistContext"
import { Button } from "@/components/ui/button"
import { Heart, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/app/contexts/CartContext"
import { useCurrency } from "@/app/contexts/CurrencyContext"
import { motion, AnimatePresence } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Coins } from "lucide-react"
import { Star } from "lucide-react" // Import Star icon

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist()
  const { addItem: addToCart } = useCart()
  const { currency, setCurrency, convertPrice, formatPrice } = useCurrency()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
          <p className="text-gray-600 mb-6">Save items you love to your wishlist</p>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Wishlist ({items.length})</h1>
        <div className="flex items-center gap-4">
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
          <Button variant="outline" onClick={clearWishlist}>
            Clear Wishlist
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="relative aspect-square">
              <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <Link
                href={`/shop/${item.gender.toLowerCase()}/${item.category.toLowerCase()}/${item.id}`}
                className="block"
              >
                <h3 className="font-semibold mb-2 hover:text-gold transition-colors">{item.name}</h3>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currency}-${item.price}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center gap-2 mb-4"
                  >
                    <p className="text-lg font-bold text-gold">{formatPrice(convertPrice(item.price))}</p>
                    {item.rating && (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </Link>
              <Button
                className="w-full"
                onClick={() => {
                  addToCart({
                    id: item.id,
                    name: item.name,
                    priceIDR: item.price, // Store original IDR price
                    imageUrl: item.imageUrl,
                    category: item.category,
                    gender: item.gender,
                  })
                  removeItem(item.id)
                }}
              >
                Move to Cart
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

